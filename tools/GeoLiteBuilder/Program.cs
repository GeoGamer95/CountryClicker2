using System.Globalization;
using System.Text.Json;

var rootPath = args.Length > 0
    ? Path.GetFullPath(args[0])
    : Directory.GetCurrentDirectory();

var assetsPath = Path.Combine(rootPath, "Assets");
var countriesSourcePath = Path.Combine(assetsPath, "countries.geojson");
var worldLandSourcePath = Path.Combine(assetsPath, "world-land-110m.geojson");
var countriesOutputPath = Path.Combine(assetsPath, "countries-lite.geojson");
var worldLandOutputPath = Path.Combine(assetsPath, "world-land-lite.geojson");
var standardCountryCodes = GetStandardCountryCodes();
var countryCodeOverrides = GetCountryCodeOverrides();

if (!File.Exists(countriesSourcePath) || !File.Exists(worldLandSourcePath))
{
    throw new FileNotFoundException("Expected source GeoJSON files were not found in Assets.");
}

BuildCountriesLite(countriesSourcePath, countriesOutputPath, standardCountryCodes, countryCodeOverrides);
BuildWorldLandLite(worldLandSourcePath, worldLandOutputPath);

Console.WriteLine(FormattableString.Invariant($"Wrote {countriesOutputPath}"));
Console.WriteLine(FormattableString.Invariant($"Wrote {worldLandOutputPath}"));

static void BuildCountriesLite(
    string inputPath,
    string outputPath,
    HashSet<string> standardCountryCodes,
    Dictionary<string, string> countryCodeOverrides)
{
    using var document = JsonDocument.Parse(File.ReadAllBytes(inputPath));
    using var stream = File.Create(outputPath);
    using var writer = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = false });

    writer.WriteStartObject();
    writer.WriteString("type", "FeatureCollection");
    writer.WritePropertyName("features");
    writer.WriteStartArray();

    foreach (var feature in document.RootElement.GetProperty("features").EnumerateArray())
    {
        var properties = feature.GetProperty("properties");
        var name = properties.GetProperty("name").GetString();
        var alpha3 = properties.GetProperty("ISO3166-1-Alpha-3").GetString();

        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(alpha3))
        {
            continue;
        }

        if (alpha3 == "-99" && countryCodeOverrides.TryGetValue(name, out var overrideCode))
        {
            alpha3 = overrideCode;
        }

        if (!standardCountryCodes.Contains(alpha3))
        {
            continue;
        }

        writer.WriteStartObject();
        writer.WriteString("type", "Feature");
        writer.WritePropertyName("properties");
        writer.WriteStartObject();
        writer.WriteString("name", name);
        writer.WriteString("ISO3166-1-Alpha-3", alpha3);
        writer.WriteEndObject();
        WriteGeometry(writer, feature.GetProperty("geometry"));
        writer.WriteEndObject();
    }

    writer.WriteEndArray();
    writer.WriteEndObject();
}

static void BuildWorldLandLite(string inputPath, string outputPath)
{
    using var document = JsonDocument.Parse(File.ReadAllBytes(inputPath));
    using var stream = File.Create(outputPath);
    using var writer = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = false });

    writer.WriteStartObject();
    writer.WriteString("type", "FeatureCollection");
    writer.WritePropertyName("features");
    writer.WriteStartArray();

    foreach (var feature in document.RootElement.GetProperty("features").EnumerateArray())
    {
        writer.WriteStartObject();
        writer.WriteString("type", "Feature");
        writer.WritePropertyName("properties");
        writer.WriteStartObject();
        writer.WriteEndObject();
        WriteGeometry(writer, feature.GetProperty("geometry"));
        writer.WriteEndObject();
    }

    writer.WriteEndArray();
    writer.WriteEndObject();
}

static void WriteGeometry(Utf8JsonWriter writer, JsonElement geometry)
{
    var geometryType = geometry.GetProperty("type").GetString();
    writer.WritePropertyName("geometry");
    writer.WriteStartObject();
    writer.WriteString("type", geometryType);
    writer.WritePropertyName("coordinates");

    switch (geometryType)
    {
        case "Polygon":
            writer.WriteStartArray();
            foreach (var ring in geometry.GetProperty("coordinates").EnumerateArray())
            {
                WriteRing(writer, ring);
            }

            writer.WriteEndArray();
            break;

        case "MultiPolygon":
            writer.WriteStartArray();
            foreach (var polygon in geometry.GetProperty("coordinates").EnumerateArray())
            {
                writer.WriteStartArray();
                foreach (var ring in polygon.EnumerateArray())
                {
                    WriteRing(writer, ring);
                }

                writer.WriteEndArray();
            }

            writer.WriteEndArray();
            break;

        default:
            writer.WriteNullValue();
            break;
    }

    writer.WriteEndObject();
}

static void WriteRing(Utf8JsonWriter writer, JsonElement ring)
{
    var simplified = SimplifyRing(ring);
    writer.WriteStartArray();

    foreach (var point in simplified)
    {
        writer.WriteStartArray();
        writer.WriteNumberValue(point.Longitude);
        writer.WriteNumberValue(point.Latitude);
        writer.WriteEndArray();
    }

    writer.WriteEndArray();
}

static IReadOnlyList<GeoPoint> SimplifyRing(JsonElement ring)
{
    var points = new List<GeoPoint>();
    foreach (var point in ring.EnumerateArray())
    {
        var values = point.EnumerateArray();
        values.MoveNext();
        var longitude = values.Current.GetDouble();
        values.MoveNext();
        var latitude = values.Current.GetDouble();
        points.Add(new GeoPoint(RoundCoordinate(longitude), RoundCoordinate(latitude)));
    }

    if (points.Count < 4)
    {
        return points;
    }

    var closed = points[0] == points[^1];
    if (closed)
    {
        points.RemoveAt(points.Count - 1);
    }

    var step = points.Count switch
    {
        > 800 => 10,
        > 400 => 6,
        > 200 => 4,
        > 100 => 2,
        _ => 1
    };

    var simplified = new List<GeoPoint>();
    for (var index = 0; index < points.Count; index += step)
    {
        var point = points[index];
        if (simplified.Count == 0 || simplified[^1] != point)
        {
            simplified.Add(point);
        }
    }

    if (simplified[^1] != points[^1])
    {
        simplified.Add(points[^1]);
    }

    if (closed && simplified[0] != simplified[^1])
    {
        simplified.Add(simplified[0]);
    }

    return simplified.Count >= 4 ? simplified : points;
}

static double RoundCoordinate(double value) =>
    double.Parse(value.ToString("0.###", CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

static HashSet<string> GetStandardCountryCodes() =>
[
    "AFG", "ALB", "DZA", "AND", "AGO", "ATG", "ARG", "ARM", "AUS", "AUT",
    "AZE", "BHS", "BHR", "BGD", "BRB", "BLR", "BEL", "BLZ", "BEN", "BTN",
    "BOL", "BIH", "BWA", "BRA", "BRN", "BGR", "BFA", "BDI", "CPV", "KHM",
    "CMR", "CAN", "CAF", "TCD", "CHL", "CHN", "COL", "COM", "COG", "CRI",
    "CIV", "HRV", "CUB", "CYP", "CZE", "COD", "DNK", "DJI", "DMA", "DOM",
    "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", "SWZ", "ETH", "FJI", "FIN",
    "FRA", "GAB", "GMB", "GEO", "DEU", "GHA", "GRC", "GRD", "GTM", "GIN",
    "GNB", "GUY", "HTI", "HND", "HUN", "ISL", "IND", "IDN", "IRN", "IRQ",
    "IRL", "ISR", "ITA", "JAM", "JPN", "JOR", "KAZ", "KEN", "KIR", "PRK",
    "KOR", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LIE",
    "LTU", "LUX", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MRT",
    "MUS", "MEX", "FSM", "MDA", "MCO", "MNG", "MNE", "MAR", "MOZ", "MMR",
    "NAM", "NRU", "NPL", "NLD", "NZL", "NIC", "NER", "NGA", "MKD", "NOR",
    "OMN", "PAK", "PLW", "PAN", "PNG", "PRY", "PER", "PHL", "POL", "PRT",
    "QAT", "ROU", "RUS", "RWA", "KNA", "LCA", "VCT", "WSM", "SMR", "STP",
    "SAU", "SEN", "SRB", "SYC", "SLE", "SGP", "SVK", "SVN", "SLB", "SOM",
    "ZAF", "SSD", "ESP", "LKA", "SDN", "SUR", "SWE", "CHE", "SYR", "TJK",
    "THA", "TLS", "TGO", "TON", "TTO", "TUN", "TUR", "TKM", "TUV", "UGA",
    "UKR", "ARE", "GBR", "TZA", "USA", "URY", "UZB", "VUT", "VEN", "VNM",
    "YEM", "ZMB", "ZWE", "VAT", "PSE", "TWN", "UNK"
];

static Dictionary<string, string> GetCountryCodeOverrides() => new(StringComparer.Ordinal)
{
    ["France"] = "FRA",
    ["Norway"] = "NOR",
    ["Kosovo"] = "UNK"
};

readonly record struct GeoPoint(double Longitude, double Latitude);
