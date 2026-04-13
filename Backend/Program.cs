using KtcWeb.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// Injection de dépendance du service Active Directory
builder.Services.AddSingleton<ActiveDirectoryService>();   // ← Ligne importante
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
}

app.UseHttpsRedirection();
app.MapControllers();

// 🔹 Redirection vers Swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();