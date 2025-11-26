using System.Text;
using auth_service.Application.Security;
using auth_service.Application.Usecase.Implementation;
using auth_service.Application.Usecase.Interface;
using auth_service.Domain.Repository;
using auth_service.Infrastructure.Database;
using auth_service.Infrastructure.Repository;
using auth_service.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Npgsql;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");
var allowedOriginsEnv = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Auth Service API", 
        Version = "v1",
        Description = "Authentication and Authorization Service API"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHealthChecks();

// Database Configuration
string ConvertDatabaseUrl(string url)
{
    if (string.IsNullOrEmpty(url))
    {
        throw new ArgumentException("Database URL cannot be null or empty");
    }

    // Handle postgresql:// format
    if (url.StartsWith("postgresql://"))
    {
        url = url.Replace("postgresql://", "postgres://");
    }

    var uri = new Uri(url);
    var userInfo = uri.UserInfo.Split(':');

    var username = userInfo[0];
    var password = userInfo.Length > 1 ? userInfo[1] : "";

    var database = uri.LocalPath.TrimStart('/');
    if (string.IsNullOrEmpty(database))
    {
        database = "auth_service";
    }

    var port = uri.Port > 0 ? uri.Port : 5432;

    var connectionString = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = port,
        Database = database,
        Username = username,
        Password = password,
        SslMode = SslMode.Require,
        TrustServerCertificate = true,
        Pooling = true,
        Timeout = 30,
        CommandTimeout = 30
    }.ToString();

    Console.WriteLine($"✅ Converted database URL");
    return connectionString;
}

builder.Services.AddDbContext<UserDbContext>(options =>
{
    if (string.IsNullOrEmpty(databaseUrl))
    {
        // Fallback to appsettings.json
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("No database configuration found");
        }
        
        Console.WriteLine("✅ Using ConnectionStrings:DefaultConnection");
        options.UseNpgsql(connectionString, 
            npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5)
            ));
    }
    else
    {
        try
        {
            Console.WriteLine("✅ Using DATABASE_URL from environment");
            var conn = ConvertDatabaseUrl(databaseUrl);
            options.UseNpgsql(conn, 
                npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5)
                ));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error converting DATABASE_URL: {ex.Message}");
            throw;
        }
    }
});

// Dependency Injection
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserUseCase, UserUseCase>();
builder.Services.AddScoped<IBcryptPasswordHasher, BcryptPasswordHasher>();
builder.Services.AddScoped<IJWTTokenProvidder, JWTTokenProvidder>();

// JWT Configuration
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        // Use environment variables, fallback to appsettings.json
        var secretKey = jwtSecret ?? builder.Configuration["JWT:SecretKey"];
        var issuer = jwtIssuer ?? builder.Configuration["JWT:Issuer"];
        var audience = jwtAudience ?? builder.Configuration["JWT:Audience"];

        if (string.IsNullOrEmpty(secretKey))
        {
            throw new InvalidOperationException("JWT Secret is not configured");
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer ?? "auth-service",
            ValidAudience = audience ?? "auth-service-client",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

// CORS Configuration
builder.Services.AddCors(options =>
{
    string[] origins;

    if (!string.IsNullOrEmpty(allowedOriginsEnv))
    {
        Console.WriteLine("✅ Using ALLOWED_ORIGINS from environment");
        origins = allowedOriginsEnv.Split(',', StringSplitOptions.RemoveEmptyEntries)
                 .Select(origin => origin.Trim())
                 .ToArray();
    }
    else
    {
        // Fallback to appsettings.json
        var allowedOriginsConfig = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();
        
        if (allowedOriginsConfig != null && allowedOriginsConfig.Length > 0)
        {
            Console.WriteLine("✅ Using AllowedOrigins from appsettings.json");
            origins = allowedOriginsConfig;
        }
        else
        {
            Console.WriteLine("⚠️ Using default CORS origins");
            origins = new[] {
                "https://coder-de-poet.vercel.app",
                "https://coder-de-poet-2.onrender.com"
            };
        }
    }

    Console.WriteLine($"🌐 CORS origins: {string.Join(", ", origins)}");

    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Database initialization
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<UserDbContext>();
    
    Console.WriteLine("🔗 Testing database connection...");
    if (dbContext.Database.CanConnect())
    {
        Console.WriteLine("✅ Database connection successful");
        
        // Apply migrations
        Console.WriteLine("🔄 Applying database migrations...");
        dbContext.Database.Migrate();
        Console.WriteLine("✅ Database migrations applied");
    }
    else
    {
        Console.WriteLine("❌ Cannot connect to database");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Database initialization failed: {ex.Message}");
}

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Auth Service API v1");
    c.RoutePrefix = "swagger";
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapHealthChecks("/health");
app.UseHttpsRedirection();
app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("🚀 Auth Service started successfully");
Console.WriteLine($"📍 Environment: {app.Environment.EnvironmentName}");
Console.WriteLine($"🌐 CORS enabled for: {string.Join(", ", allowedOriginsEnv?.Split(',') ?? builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new string[0])}");

app.Run();