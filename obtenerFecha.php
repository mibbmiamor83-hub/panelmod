<?php
// Configurar la zona horaria de Paraguay
date_default_timezone_set("America/Asuncion");

// Leer el cuerpo de la solicitud
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Validar duración recibida
if (!isset($data["duracionMeses"]) || !is_numeric($data["duracionMeses"])) {
    http_response_code(400);
    echo json_encode(["error" => "Duración no válida."]);
    exit;
}

$duracionMeses = intval($data["duracionMeses"]);

// Fecha actual
$fechaCreacion = date("d/m/Y H:i:s");

// Calcular fecha de vencimiento
$fechaVencimiento = date("d/m/Y H:i:s", strtotime("+$duracionMeses months"));

// Responder con las fechas
echo json_encode([
    "fechaCreacion" => $fechaCreacion,
    "fechaVencimiento" => $fechaVencimiento
]);
