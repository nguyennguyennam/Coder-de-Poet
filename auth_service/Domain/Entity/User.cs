/*
    Model defines the User entity for the Learnix application.

*/

using System;

namespace auth_service.Domain.Entity
{
    public enum UserRole
    {
        Normal_Student,
        Premium_Student,
        Instructor,
        Admin

    }

    public class User
    {
        public Guid Id { get; private set; }
        public string Email { get; private set; } = string.Empty;
        //Hased password for security
        public string HashedPassword { get; private set; } = string.Empty;

        public string FullName { get; private set; } = string.Empty;
        public string AvatarUrl { get; private set; } = string.Empty;

        public UserRole UserRole { get; private set; }  // renamed from Role

        public DateTime dateofBirth {get; private set;} = DateTime.MinValue;
        public DateTime CreatedAt {get; private set;} = DateTime.UtcNow;
        public DateTime UpdatedAt {get; private set;} = DateTime.UtcNow;
        public string RefreshToken { get; private set; } = string.Empty;
        public DateTime RefreshTokenExpiry {get; private set;} = DateTime.UtcNow;

        //ORM Constructor
        protected User() {}

        //Constructors
        public User (string email, string hashedPassword, string fullName, string refreshToken, DateTime refreshTokenExpiry, DateTime dob, string avatarUrl_)
        {
            Email = email;
            HashedPassword = hashedPassword;
            FullName = fullName;
            UserRole = UserRole.Normal_Student;
            RefreshToken = refreshToken;
            RefreshTokenExpiry = refreshTokenExpiry;
            dateofBirth = dob;
            AvatarUrl = avatarUrl_;
        }
          
        //Getters and Setters 

        public void UpdateEmailPassword (string email, string hashedPassword)
        {
            Email = email;
            HashedPassword = hashedPassword;
            UpdatedAt = DateTime.UtcNow;
        }

        //Update RefreshToken 
        public void UpdateRefreshToken (string refreshToken, DateTime refreshTokenExpiry)
        {
            RefreshToken = refreshToken;
            RefreshTokenExpiry = refreshTokenExpiry;
        }

        //Update User Role  
        public void updateUserRole (UserRole newRole)
        {
            UserRole = newRole;
            UpdatedAt = DateTime.UtcNow;
        }

        public void updateUserInfo (string fullName, DateTime dob, string avatarUrl_)
        {
            FullName = fullName;
            dateofBirth = dob;
            AvatarUrl = avatarUrl_;
            UpdatedAt = DateTime.UtcNow;
        }

        // Keep legacy getters if needed
        public string GetEmail() => Email;
        public string GetHashedPassword() => HashedPassword;
        public string GetFullName() => FullName;
        public UserRole GetUserRole() => UserRole;
        public string GetRefreshToken() => RefreshToken;
        
     }
}
