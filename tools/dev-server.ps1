# Local preview server for the site (static files only) – for trying the site on your own computer.
# Usage (from the project folder): powershell -ExecutionPolicy Bypass -File tools\dev-server.ps1
# then open http://localhost:5180/index.html
param([string]$Root = (Split-Path $PSScriptRoot -Parent), [int]$Port = 5180)
$types = @{ ".html"="text/html; charset=utf-8"; ".js"="text/javascript; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".md"="text/plain; charset=utf-8"; ".svg"="image/svg+xml" }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Serving $Root on http://localhost:$Port/"
while ($l.IsListening) {
  $c = $l.GetContext()
  try {
    $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
    if ($p -eq "") { $p = "index.html" }
    $f = Join-Path $Root $p
    $c.Response.Headers.Add("Cache-Control", "no-store")
    # Local-only helper: POST /__save/<path> writes the request body to <path> under the root.
    # Used to save data/games.js from tools/builder.html, because the app's browser pane can't download files.
    # Only data/*.js files inside the root are allowed.
    if ($c.Request.HttpMethod -eq "POST" -and $p.StartsWith("__save/")) {
      $rel = $p.Substring(7)
      $target = [IO.Path]::GetFullPath((Join-Path $Root $rel))
      $rootFull = [IO.Path]::GetFullPath($Root)
      if ($target.StartsWith($rootFull) -and $rel -match '(^|/)data/[\w\-]+\.js$') {
        $reader = New-Object IO.StreamReader($c.Request.InputStream, [Text.Encoding]::UTF8)
        [IO.File]::WriteAllText($target, $reader.ReadToEnd(), (New-Object Text.UTF8Encoding $false))
        Write-Host "Saved $target"
        $c.Response.StatusCode = 200
      } else { $c.Response.StatusCode = 403 }
      continue
    }
    if ((Test-Path $f -PathType Leaf) -and -not $p.StartsWith("api")) {
      $b = [IO.File]::ReadAllBytes($f)
      $ext = [IO.Path]::GetExtension($f)
      $c.Response.ContentType = $(if ($types[$ext]) { $types[$ext] } else { "application/octet-stream" })
      $c.Response.ContentLength64 = $b.Length
      if ($c.Request.HttpMethod -ne "HEAD") { $c.Response.OutputStream.Write($b, 0, $b.Length) }
    } else { $c.Response.StatusCode = 404 }
  } catch { Write-Host $_ }
  finally { $c.Response.Close() }
}
