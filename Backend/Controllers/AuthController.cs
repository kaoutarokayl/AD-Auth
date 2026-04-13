using Microsoft.AspNetCore.Mvc;
using KtcWeb.Services;
using KtcWeb.Models;        // ← Ajoute ceci

namespace KtcWeb.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ActiveDirectoryService _adService;

        // Injection de dépendance via le constructeur
        public AuthController(ActiveDirectoryService adService)
        {
            _adService = adService;
        }


        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            Console.WriteLine($"Tentative login pour : {request.Username}");

            bool isAuth = _adService.Authenticate(request.Username, request.Password);

            if (!isAuth)
                return Unauthorized("Identifiants invalides");

            var roles = _adService.GetRoles(request.Username, request.Password);

            return Ok(new
            {
                Username = request.Username,
                Roles = roles
            });
        }
    }
}