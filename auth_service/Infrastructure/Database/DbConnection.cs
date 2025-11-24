/*
    This file sets up the connection to the NeonDb database using connection string
*/

using Microsoft.Extensions.Configuration;
using Npgsql;
using System.Text;

namespace auth_service.Infrastructure.Database
{
    public class DbConnection
    {
        private readonly string _connectionString;

        private readonly IConfiguration _configuration;

        public DbConnection (IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("DATABASE_URL:") ?? string.Empty;
        }


        public async Task<NpgsqlConnection> GetNpgsqlConnectionAsync()
        {
            try
            {
                await using var conn = new NpgsqlConnection(_connectionString);
                Console.WriteLine("Database connection established.");
                return conn;
            }

            catch (Exception ex)
            {
                Console.WriteLine($"Error connecting to the database: {ex.Message}");
                throw;
            }
        }

    }
}
