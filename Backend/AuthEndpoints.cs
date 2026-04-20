using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace ElaDisseSim.Api.Features.Auth;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/login", (LoginRequest request, IConfiguration config) =>
        {
            var adminUser = config["Auth:Username"];
            var adminPassword = config["Auth:Password"];
            if (request.Username == adminUser && request.Password == adminPassword)
            {
                var issuer = config["Jwt:Issuer"] ?? "ElaDisseSim";
                var audience = config["Jwt:Audience"] ?? "ElaDisseSimUI";
                var key = Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? "chave-fallback-super-segura-1234567890");

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim(JwtRegisteredClaimNames.Sub, request.Username),
                        new Claim(ClaimTypes.Role, "Admin")
                    }),
                    Expires = DateTime.UtcNow.AddHours(8),
                    Issuer = issuer,
                    Audience = audience,
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var jwtToken = tokenHandler.WriteToken(token);

                return Results.Ok(new { Token = jwtToken });
            }

            return Results.Unauthorized();
        }).RequireRateLimiting("LoginLimit");
    }
}

public record LoginRequest(string Username, string Password);