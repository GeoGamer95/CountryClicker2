using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var assetsPath = FindAssetsPath(app.Environment.ContentRootPath, AppContext.BaseDirectory);
var contentTypeProvider = new FileExtensionContentTypeProvider();
contentTypeProvider.Mappings[".geojson"] = "application/geo+json";

app.UseDefaultFiles();
app.UseStaticFiles();

if (assetsPath is not null)
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(assetsPath),
        RequestPath = "/assets",
        ContentTypeProvider = contentTypeProvider
    });
}

app.MapFallbackToFile("index.html");
app.Run();

static string? FindAssetsPath(params string[] roots)
{
    foreach (var root in roots.Where(static value => !string.IsNullOrWhiteSpace(value)))
    {
        var current = new DirectoryInfo(root);

        while (current is not null)
        {
            var candidate = Path.Combine(current.FullName, "Assets");
            if (Directory.Exists(candidate) && File.Exists(Path.Combine(candidate, "countries.geojson")))
            {
                return candidate;
            }

            current = current.Parent;
        }
    }

    return null;
}
