/*
    This class implements the IUserUseCase interface to handle user-related business logic,
    including:
        + sign in/ sign up
        + Update user info
        + Refresh token
        + Sign in via Google OAuth2 (later)
        + Reset password (later)
    Using Interfaces in Security and Repository layers to perform operations.
*/

using auth_service.Application.Security;
using auth_service.Application.Usecase.DTO;
using auth_service.Application.Usecase.Interface;
using auth_service.Domain.Entity;
using auth_service.Domain.Repository;

namespace auth_service.Application.Usecase.Implementation
{
    public class UserUseCase : IUserUseCase
    {
        private readonly IUserRepository _userRepository;
        private readonly IJWTTokenProvidder _jwtTokenProvider;
        private readonly IBcryptPasswordHasher _passwordHasher;

        public UserUseCase (IUserRepository userRepository, IJWTTokenProvidder jwtTokenProvider, IBcryptPasswordHasher passwordHasher)
        {
            _userRepository = userRepository;
            _jwtTokenProvider = jwtTokenProvider;
            _passwordHasher = passwordHasher;
        }

        // Implementations of IUserUseCase methods 
        public async Task <AuthResult> SignUpAsync (SignUpRequest signUpRequest)
        {
            
        }
    }
}