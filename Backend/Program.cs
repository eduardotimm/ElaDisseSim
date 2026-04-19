using ElaDisseSim.Api.Database;
using ElaDisseSim.Api.Features.Rsvp;
using ElaDisseSim.Api.Features.Gifts;
using ElaDisseSim.Api.Features.Vendors;
using ElaDisseSim.Api.Features.Faqs;
using Microsoft.EntityFrameworkCore;
using ElaDisseSim.Api.Features.Auth; 
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Configura o CORS para permitir requisições do frontend React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// Configura o Entity Framework Core usando SQLite
var dbPath = Environment.GetEnvironmentVariable("DB_PATH") ?? "eladissesim.db";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// Adiciona serviços de Autenticação e Autorização via JWT
builder.Services.AddAuthorization();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = builder.Configuration["Jwt:Key"] ?? "chave-fallback-super-segura-1234567890";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
        };
    });

// Configura a proteção de limite de requisições (Rate Limiting)
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("LoginLimit", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(5); // Janela de tempo de 5 minutos
        opt.PermitLimit = 5; // Máximo de 5 tentativas
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0; // Sem fila de espera, rejeita imediatamente
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();
// Garante que o banco de dados (e as tabelas) seja criado na inicialização
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    // Truque para adicionar a nova coluna na tabela existente sem perder dados
    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE \"Vendors\" ADD COLUMN \"IsPerPerson\" INTEGER NOT NULL DEFAULT 0;");
    }
    catch
    {
        // Se cair aqui, é porque a coluna já foi criada anteriormente, então apenas ignoramos!
    }
    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE \"Vendors\" ADD COLUMN \"PaymentDate\" TEXT;");
    }
    catch { }
    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE \"Gifts\" ADD COLUMN \"ReservedUntil\" TEXT;");
    }
    catch { }

    // Cria a tabela Faqs se não existir
    try
    {
        db.Database.ExecuteSqlRaw("CREATE TABLE IF NOT EXISTS \"Faqs\" (\"Id\" INTEGER NOT NULL CONSTRAINT \"PK_Faqs\" PRIMARY KEY AUTOINCREMENT, \"Question\" TEXT NOT NULL, \"Answer\" TEXT NOT NULL);");
    }
    catch { }
    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE \"Faqs\" ADD COLUMN \"Order\" INTEGER NOT NULL DEFAULT 0;");
    }
    catch { }
    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE \"Vendors\" ADD COLUMN \"Installments\" INTEGER;");
    }
    catch { }
    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE \"Vendors\" ADD COLUMN \"PaidInstallments\" INTEGER NOT NULL DEFAULT 0;");
    }
    catch { }
    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE \"Vendors\" ADD COLUMN \"Status\" TEXT NOT NULL DEFAULT 'A Consultar';");
    }
    catch { }
    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE \"Vendors\" ADD COLUMN \"ConsiderCost\" INTEGER NOT NULL DEFAULT 1;");
    }
    catch { }
    try
    {
        // Migra fornecedores antigos que estavam com IsHired = true para o novo status
        db.Database.ExecuteSqlRaw("UPDATE \"Vendors\" SET \"Status\" = 'Contratado' WHERE \"IsHired\" = 1 AND \"Status\" = 'A Consultar';");
    }
    catch { }
}

app.MapGet("/", () => "API do Ela Disse Sim está rodando!");

// Mapeia a rota /api/families
app.MapFamilyEndpoints();
app.MapGiftEndpoints();
app.MapVendorEndpoints();
app.MapFaqEndpoints();
app.MapAuthEndpoints(); // adicione perto das outras rotas

app.Run();
