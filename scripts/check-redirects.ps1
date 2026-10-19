param(
    [string]$Origin = 'https://nszgoaride.com',
    [switch]$Local,
    [int]$MaxRedirects = 5
)

$ErrorActionPreference = 'Stop'
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.Net.Http
$canonicalOrigin = 'https://nszgoaride.com'
$originUri = [Uri]$Origin
if ($originUri.Scheme -notin @('http', 'https') -or $originUri.AbsolutePath -ne '/' -or $originUri.Query -or $originUri.Fragment) {
    throw 'Origin must contain only the scheme and host, for example https://nszgoaride.com or http://localhost:8888.'
}

$handler = [System.Net.Http.HttpClientHandler]::new()
$handler.AllowAutoRedirect = $false
$client = [System.Net.Http.HttpClient]::new($handler)

function Get-RedirectTrace {
    param([Uri]$StartUri)

    $currentUri = $StartUri
    $visited = @{}
    $chain = @()

    for ($hop = 0; $hop -le $MaxRedirects; $hop++) {
        if ($visited.ContainsKey($currentUri.AbsoluteUri)) {
            throw "Redirect loop detected at $($currentUri.AbsoluteUri). Chain: $($chain -join ' -> ')"
        }
        $visited[$currentUri.AbsoluteUri] = $true

        $request = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Get, $currentUri)
        try {
            $response = $client.SendAsync($request).GetAwaiter().GetResult()
        } finally {
            $request.Dispose()
        }

        try {
            $status = [int]$response.StatusCode
            if ($status -ge 300 -and $status -lt 400) {
                $location = $response.Headers.Location
                if (-not $location) {
                    throw "Redirect from $($currentUri.AbsoluteUri) has no Location header."
                }

                $nextUri = [Uri]::new($currentUri, $location)
                $chain += "$status $($currentUri.AbsoluteUri) -> $($nextUri.AbsoluteUri)"
                if ($nextUri.AbsoluteUri -eq $currentUri.AbsoluteUri) {
                    throw "Self-redirect detected at $($currentUri.AbsoluteUri)."
                }
                $currentUri = $nextUri
                continue
            }

            $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            return [pscustomobject]@{
                StatusCode = $status
                FinalUri   = $currentUri
                Body       = $body
                Chain      = $chain
            }
        } finally {
            $response.Dispose()
        }
    }

    throw "More than $MaxRedirects redirects from $($StartUri.AbsoluteUri). Chain: $($chain -join ' -> ')"
}

function Assert-Page {
    param(
        [string]$Path,
        [string]$ExpectedCanonical,
        [switch]$SevenSeater
    )

    $requestedUri = [Uri]::new($originUri, $Path)
    $result = Get-RedirectTrace -StartUri $requestedUri
    if ($result.StatusCode -lt 200 -or $result.StatusCode -ge 300) {
        throw "$($requestedUri.AbsoluteUri) ended with HTTP $($result.StatusCode)."
    }
    $expectedFinalUri = if ($Local) { $requestedUri.AbsoluteUri } else { $ExpectedCanonical }
    if ($result.FinalUri.AbsoluteUri -ne $expectedFinalUri) {
        throw "$($requestedUri.AbsoluteUri) ended at $($result.FinalUri.AbsoluteUri), expected $expectedFinalUri."
    }

    $canonicalMatch = [regex]::Match($result.Body, '<link\b(?=[^>]*\brel=["'']canonical["''])(?=[^>]*\bhref=["'']([^"'']+)["''])[^>]*>', 'IgnoreCase')
    if (-not $canonicalMatch.Success -or $canonicalMatch.Groups[1].Value -ne $ExpectedCanonical) {
        throw "$($result.FinalUri.AbsoluteUri) does not contain the expected self-canonical $ExpectedCanonical."
    }

    if ($SevenSeater) {
        if ($result.Body -notmatch '<title>7 Seater Car Rental in Goa \| NSZ Goa Ride</title>' -or
            $result.Body -notmatch '<h1\b[^>]*>.*?7 Seater.*?Car Rental.*?in Goa.*?</h1>' -or
            $result.Body -notmatch 'Maruti Ertiga' -or
            $result.Body -notmatch 'Toyota Innova Crysta' -or
            $result.Body -notmatch 'Toyota Innova Hycross') {
            throw 'Seven-seater page title, H1, or listed vehicle content is missing.'
        }
    }

    $redirectCount = $result.Chain.Count
    Write-Host "PASS $($requestedUri.AbsoluteUri) -> HTTP $($result.StatusCode), $redirectCount redirect(s), canonical $ExpectedCanonical"
}

try {
    $routePaths = @(
        '/',
        '/bikes/',
        '/cars/',
        '/automatic-car-rental-goa/',
        '/goa-airport-car-rental/',
        '/7-seater-car-rental-goa/'
    )

    foreach ($path in $routePaths) {
        $expectedCanonical = "$canonicalOrigin$path"
        Assert-Page -Path $path -ExpectedCanonical $expectedCanonical -SevenSeater:($path -eq '/7-seater-car-rental-goa/')
    }

    if (-not $Local) {
        $canonicalSevenSeater = "$canonicalOrigin/7-seater-car-rental-goa/"
        $alternates = @(
            'http://nszgoaride.com/7-seater-car-rental-goa/',
            'https://www.nszgoaride.com/7-seater-car-rental-goa/',
            'https://nszgoaride.com/7-seater-car-rental-goa',
            'http://www.nszgoaride.com/7-seater-car-rental-goa/',
            'http://nszgoaride.com/7-seater-car-rental-goa'
        )

        foreach ($alternate in $alternates) {
            $result = Get-RedirectTrace -StartUri ([Uri]$alternate)
            if ($result.StatusCode -lt 200 -or $result.StatusCode -ge 300 -or
                $result.FinalUri.AbsoluteUri -ne $canonicalSevenSeater) {
                throw "$alternate did not resolve to $canonicalSevenSeater."
            }

            Write-Host "PASS $alternate -> HTTP $($result.StatusCode), $($result.Chain.Count) redirect(s), $($result.FinalUri.AbsoluteUri)"
        }
    }
} finally {
    $client.Dispose()
    $handler.Dispose()
}
