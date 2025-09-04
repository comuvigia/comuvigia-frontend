#!/bin/bash

upload_file() {
    local file=$1
    local content_type=$2
    
    echo "Subiendo: $file con content-type: $content_type"
    oci os object put \
        --bucket-name frontend-comuvigia \
        --namespace-name grwyyugvgqpt \
        --name "$file" \
        --file "./dist/$file" \
        --content-type "$content_type" \
        --force
}

# Subir archivos principales
upload_file "index.html" "text/html"
upload_file "asset-manifest.json" "application/json"
upload_file "manifest.json" "application/json"
upload_file "favicon.ico" "image/x-icon"

# Subir archivos CSS
find ./dist -name "*.css" | while read -r css_file; do
    rel_path=${css_file#./dist/}
    upload_file "$rel_path" "text/css"
done

# Subir archivos JS
find ./dist -name "*.js" | while read -r js_file; do
    rel_path=${js_file#./dist/}
    upload_file "$rel_path" "application/javascript"
done

# Subir imágenes
find ./dist \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" -o -name "*.ico" \) | while read -r img_file; do
    rel_path=${img_file#./dist/}
    if [[ $rel_path == *.png ]]; then
        upload_file "$rel_path" "image/png"
    elif [[ $rel_path == *.jpg || $rel_path == *.jpeg ]]; then
        upload_file "$rel_path" "image/jpeg"
    elif [[ $rel_path == *.gif ]]; then
        upload_file "$rel_path" "image/gif"
    elif [[ $rel_path == *.svg ]]; then
        upload_file "$rel_path" "image/svg+xml"
    elif [[ $rel_path == *.ico ]]; then
        upload_file "$rel_path" "image/x-icon"
    fi
done

echo "¡Subida completada! Todos los archivos de dist/ fueron subidos con sus content-types correctos."