#!/bin/bash

# Print in bold green
green_bold() {
  echo -e "$(tput bold)$(tput setaf 2)$1$(tput sgr0)"
}

to_pascal_case() {
  echo "$1" | sed -E 's/(^|-)([a-z])/\U\2/g'
}

to_camel_case() {
  echo "$1" | sed -E 's/-([a-z])/\U\1/g' | sed -E 's/^(.)/\L\1/'
}

read -rp "Module name: " module_name

# Paths
folder="src/modules/$module_name"
base_name="$(basename "$module_name")"
class_name=$(to_pascal_case "$base_name")   
var_name=$(to_camel_case "$base_name")      
tests_folder="$folder/__tests__"
dto_folder="$folder/dto"

# Create folders
mkdir -p "$folder" "$dto_folder" "$tests_folder"
green_bold "✅ Created folders:"
green_bold "  - $folder"
green_bold "  - $dto_folder"
green_bold "  - $tests_folder"

cd "$folder" || { echo "❌ Failed to enter $folder"; exit 1; }

# ✅ Create route.ts
cat > "$base_name.route.ts" <<EOF
import { Router } from "express";
import ${class_name}Controller from "./$base_name.controller";

const ${var_name}: Router = Router();
const controller = new ${class_name}Controller();

${var_name}.post('/');

export default ${var_name};
EOF

# Create controller.ts
cat > "$base_name.controller.ts" <<EOF
import Api from "@/lib/api";
import ${class_name}Service from "./$base_name.service";

export default class ${class_name}Controller extends Api {
  private readonly ${var_name}Service: ${class_name}Service;

  constructor(${var_name}Service?: ${class_name}Service) {
    super();
    this.${var_name}Service = ${var_name}Service ?? new ${class_name}Service();
  }
}
EOF

# Create service.ts
cat > "$base_name.service.ts" <<EOF
export default class ${class_name}Service {}
EOF

cat > "dto/$base_name.dto.ts" <<EOF
import { IsString } from 'class-validator';

export class ${module_name}${base_name}Dto {
  @IsString()
  id: string;
}
EOF

# Create test files
touch "__tests__/$base_name.controller.test.ts"
touch "__tests__/$base_name.service.test.ts"

touch "dto/$base_name.dto.ts"

green_bold "✅ Created files:"
green_bold "  - $base_name.controller.ts"
green_bold "  - $base_name.service.ts"
green_bold "  - $base_name.route.ts"
green_bold "  - __tests__/$base_name.controller.test.ts"
green_bold "  - __tests__/$base_name.service.test.ts"