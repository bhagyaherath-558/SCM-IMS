# SCM-IMS Backend Launcher Script

# 1. Detect Java Home
$jdkPath = ""
if (Test-Path "C:\Program Files\Java\jdk-25") {
    $jdkPath = "C:\Program Files\Java\jdk-25"
} elseif (Test-Path "C:\Program Files\Java\jdk-24") {
    $jdkPath = "C:\Program Files\Java\jdk-24"
} else {
    # Find any JDK in C:\Program Files\Java
    $jdks = Get-ChildItem -Path "C:\Program Files\Java" -Filter "jdk-*"
    if ($jdks.Count -gt 0) {
        $jdkPath = $jdks[0].FullName
    }
}

if ($jdkPath -eq "") {
    Write-Error "No JDK installation found in 'C:\Program Files\Java'. Please install Java 21+."
    Read-Host "Press Enter to exit..."
    exit
}

Write-Host "Using JDK path: $jdkPath"
$env:JAVA_HOME = $jdkPath

# 2. Path to Maven
$mvnPath = "C:\Users\ACER\.gemini\antigravity\scratch\maven\apache-maven-3.9.6\bin\mvn.cmd"
if (-not (Test-Path $mvnPath)) {
    Write-Error "Local Maven installation not found at '$mvnPath'."
    Read-Host "Press Enter to exit..."
    exit
}

Write-Host "Starting Spring Boot backend..."
& $mvnPath spring-boot:run
