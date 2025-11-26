/*
    This file using Entity Framework Core as ORM to interact with the NeonDb database.
    Mapping domain entities to database tables and configuring the DbContext.
*/

using auth_service.Domain.Entity;
using Microsoft.EntityFrameworkCore;


namespace auth_service.Infrastructure.Database
{
    public class UserDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public UserDbContext(DbContextOptions<UserDbContext> options) : base(options) { }
        public UserDbContext() { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(u => u.Id);
                
                // Cấu hình UserRole - QUAN TRỌNG
                entity.Property(u => u.UserRole)
                    .HasConversion<string>() // ⬅️ Chuyển enum thành string
                    .IsRequired()
                    .HasMaxLength(50);

                // Cấu hình DateOfBirth
                entity.Property(u => u.DateOfBirth)
                    .HasColumnName("DateOfBirth")
                    .HasColumnType("date")
                    .IsRequired();

                // Các property khác
                entity.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(u => u.FullName)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(u => u.HashedPassword)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(u => u.RefreshToken)
                    .HasMaxLength(500);

                entity.Property(u => u.AvatarUrl)
                    .HasMaxLength(1000);
    });
}
    }

}


