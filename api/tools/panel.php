<?php
header('Content-Type: application/json');

// Konfigurasi
$SECRET_API_KEY = "aldixdcodex"; // Ganti dengan API key rahasia Anda

// Fungsi untuk mengirim request ke Pterodactyl
function pterodactylRequest($url, $apiKey, $method = 'GET', $data = null) {
    $ch = curl_init();
    
    $options = [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        CURLOPT_CUSTOMREQUEST => $method,
    ];
    
    if ($method === 'POST' && $data) {
        $options[CURLOPT_POSTFIELDS] = json_encode($data);
    }
    
    curl_setopt_array($ch, $options);
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Validasi API key
if (!isset($_GET['apikey']) || $_GET['apikey'] !== $SECRET_API_KEY) {
    echo json_encode([
        'status' => 'false',
        'creator' => 'AldiXDHOST'
    ]);
    exit;
}

// Validasi parameter yang diperlukan
$requiredParams = ['username', 'password', 'ram', 'nestid', 'locid', 'eggid', 'domain', 'ptla'];
foreach ($requiredParams as $param) {
    if (!isset($_GET[$param])) {
        echo json_encode([
            'status' => 'false',
            'creator' => 'AldiXDHOST'
        ]);
        exit;
    }
}

// Ekstrak parameter
$username = $_GET['username'];
$password = $_GET['password'];
$ram = intval($_GET['ram']);
$nestId = intval($_GET['nestid']);
$locId = intval($_GET['locid']);
$eggId = intval($_GET['eggid']);
$domain = $_GET['domain'];
$ptla = $_GET['ptla'];

// Konfigurasi Pterodactyl
$pterodactylUrl = "https://" . $domain;
$pterodactylApiKey = $ptla;

// Data untuk membuat server
$serverData = [
    'name' => $username,
    'user' => 1, // ID user yang akan ditetapkan
    'egg' => $eggId,
    'docker_image' => 'quay.io/pterodactyl/core:java',
    'startup' => '',
    'environment' => [],
    'limits' => [
        'memory' => ($ram === 0) ? -1 : $ram,
        'swap' => 0,
        'disk' => 1024,
        'io' => 500,
        'cpu' => 0 // 0 berarti unlimited
    ],
    'feature_limits' => [
        'databases' => 0,
        'backups' => 0
    ],
    'allocation' => [
        'default' => $locId
    ]
];

try {
    // Buat server di Pterodactyl
    $response = pterodactylRequest(
        $pterodactylUrl . '/api/application/servers',
        $pterodactylApiKey,
        'POST',
        $serverData
    );

    // Siapkan response
    $responseData = [
        'status' => 'true',
        'creator' => 'AldiXDHOST',
        'username' => $username,
        'password' => $password,
        'ram' => ($ram === 0) ? '0' : $ram . 'GB',
        'cpu' => '0'
    ];

    echo json_encode($responseData);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'false',
        'creator' => 'AldiXDHOST'
    ]);
}
?>
