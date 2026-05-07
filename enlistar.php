<?php
// Forzamos a que el contenido se muestre como texto (en lugar de HTML o XML)
header('Content-Type: text/plain; charset=utf-8');

// Directorio donde se encuentra este script
$directorio = __DIR__;

// Obtenemos el listado de archivos
$archivos = scandir($directorio);

foreach ($archivos as $archivo) {
    // Omitimos el propio script
    if ($archivo === basename(__FILE__)) {
        continue;
    }

    // Obtenemos la extensi贸n en min煤sculas
    $extension = strtolower(pathinfo($archivo, PATHINFO_EXTENSION));

     // Si la extensión es js, html o php
    if ($extension === 'js' || $extension === 'html' || $extension === 'php') {
        echo "===============================================\n";
        echo "Nombre del archivo: " . $archivo . "\n";
        echo "===============================================\n\n";

        // Leemos el contenido
        $contenido = file_get_contents($archivo);

        // Lo mostramos tal cual
        echo $contenido . "\n\n";
    }
}
?>