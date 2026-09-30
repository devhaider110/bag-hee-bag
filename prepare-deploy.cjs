const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const FRONTEND = path.join(ROOT, "frontend");
const BACKEND = path.join(ROOT, "backend");

const BACKUP = path.join(
  ROOT,
  `.deploy-backup-${Date.now()}`
);

function exists(file) {
  return fs.existsSync(file);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

function backup(file) {
  if (!exists(file)) return;

  const relative = path.relative(ROOT, file);
  const destination = path.join(BACKUP, relative);

  fs.mkdirSync(path.dirname(destination), {
    recursive: true,
  });

  fs.copyFileSync(file, destination);
}

function updateFile(file, updater) {
  if (!exists(file)) {
    console.log(`⚠️ Not found: ${path.relative(ROOT, file)}`);
    return;
  }

  const original = read(file);
  const updated = updater(original);

  if (original === updated) {
    console.log(`✓ Already OK: ${path.relative(ROOT, file)}`);
    return;
  }

  backup(file);
  write(file, updated);

  console.log(`✓ Updated: ${path.relative(ROOT, file)}`);
}

// ======================================================
// CHECK PROJECT
// ======================================================

console.log("\n========================================");
console.log(" BAG HEE BAG - DEPLOYMENT PREPARATION");
console.log("========================================\n");

if (!exists(FRONTEND) || !exists(BACKEND)) {
  console.error(
    "❌ frontend/backend folder nahi mila."
  );
  console.error(
    "Script project ke root folder mein run karo."
  );
  process.exit(1);
}

console.log("✓ Project root verified");

// ======================================================
// BACKUP DIRECTORY
// ======================================================

fs.mkdirSync(BACKUP, {
  recursive: true,
});

console.log(
  `✓ Backup folder created: ${path.basename(BACKUP)}`
);

// ======================================================
// 1. ROOT .gitignore
// ======================================================

const gitignore = path.join(ROOT, ".gitignore");

const requiredGitignore = `
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Dependencies
node_modules/

# Build
dist/
dist-ssr/

# Environment variables
.env
.env.*
!.env.example

# Local files
*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea/
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`.trim() + "\n";

if (exists(gitignore)) {
  const current = read(gitignore);

  const additions = [
    "node_modules/",
    "dist/",
    "dist-ssr/",
    ".env",
    ".env.*",
    "!.env.example",
    "*.local",
  ];

  let updated = current;

  for (const line of additions) {
    if (!updated.includes(line)) {
      updated += `\n${line}`;
    }
  }

  if (updated !== current) {
    backup(gitignore);
    write(gitignore, updated);
    console.log("✓ Updated: .gitignore");
  } else {
    console.log("✓ Already OK: .gitignore");
  }
} else {
  write(gitignore, requiredGitignore);
  console.log("✓ Created: .gitignore");
}

// ======================================================
// 2. BACKEND PACKAGE.JSON
// ======================================================

const backendPackage = path.join(
  BACKEND,
  "package.json"
);

updateFile(backendPackage, (content) => {
  let pkg;

  try {
    pkg = JSON.parse(content);
  } catch {
    console.log(
      "⚠️ backend/package.json JSON invalid. Skipping."
    );
    return content;
  }

  pkg.main = "server.js";

  pkg.scripts = {
    ...(pkg.scripts || {}),
    start: "node server.js",
  };

  return JSON.stringify(pkg, null, 2) + "\n";
});

// ======================================================
// 3. BACKEND SERVER CORS
// ======================================================

const serverFile = path.join(
  BACKEND,
  "server.js"
);

updateFile(serverFile, (content) => {
  let updated = content;

  const oldCors = `const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
};`;

  const newCors = `const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error("Not allowed by CORS")
    );
  },
  credentials: true,
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};`;

  if (updated.includes(oldCors)) {
    updated = updated.replace(
      oldCors,
      newCors
    );
  } else if (
    updated.includes(
      'origin: "http://localhost:5173"'
    )
  ) {
    updated = updated.replace(
      /const corsOptions = \{[\s\S]*?\n\};/,
      newCors
    );
  }

  updated = updated.replace(
    /app\.options\(\/\.\* \/, cors\(corsOptions\)\);/,
    "app.options(/.*/, cors(corsOptions));"
  );

  return updated;
});

// ======================================================
// 4. PRODUCT ROUTES SECURITY
// ======================================================

const productRoutes = path.join(
  BACKEND,
  "routes",
  "productRoutes.js"
);

updateFile(productRoutes, (content) => {
  let updated = content;

  if (
    !updated.includes(
      'require("../middleware/authMiddleware")'
    )
  ) {
    const firstImportEnd =
      updated.indexOf("\n");

    if (firstImportEnd !== -1) {
      updated =
        updated.slice(0, firstImportEnd + 1) +
        `const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");
` +
        updated.slice(firstImportEnd + 1);
    }
  }

  const lines = updated.split("\n");

  const mutationMethods = [
    "router.post(",
    "router.put(",
    "router.delete(",
    "router.patch(",
  ];

  const result = [];
  let insideRoute = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    const isMutation =
      mutationMethods.some((method) =>
        line.includes(method)
      );

    if (
      isMutation &&
      !line.includes("protect") &&
      !line.includes("adminOnly")
    ) {
      line = line.replace(
        /router\.(post|put|delete|patch)\(([^,]+),/,
        "router.$1($2, protect, adminOnly,"
      );
    }

    result.push(line);
  }

  return result.join("\n");
});

// ======================================================
// 5. CATEGORY ROUTES SECURITY
// ======================================================

const categoryRoutes = path.join(
  BACKEND,
  "routes",
  "categoryRoutes.js"
);

updateFile(categoryRoutes, (content) => {
  let updated = content;

  if (
    !updated.includes(
      'require("../middleware/authMiddleware")'
    )
  ) {
    const firstImportEnd =
      updated.indexOf("\n");

    if (firstImportEnd !== -1) {
      updated =
        updated.slice(0, firstImportEnd + 1) +
        `const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");
` +
        updated.slice(firstImportEnd + 1);
    }
  }

  updated = updated.replace(
    /router\.(post|put|delete|patch)\(([^,]+),/g,
    (match, method, pathPart) => {
      if (
        match.includes("protect") ||
        match.includes("adminOnly")
      ) {
        return match;
      }

      return `router.${method}(${pathPart}, protect, adminOnly,`;
    }
  );

  return updated;
});

// ======================================================
// 6. CUSTOMER SERVICE API NORMALIZATION
// ======================================================

const customerService = path.join(
  FRONTEND,
  "src",
  "services",
  "customerService.js"
);

updateFile(customerService, (content) => {
  let updated = content;

  const oldBlock =
    `const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";`;

  const newBlock =
    `const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\\/api$/, "");`;

  if (updated.includes(oldBlock)) {
    updated = updated.replace(
      oldBlock,
      newBlock
    );
  }

  return updated;
});

// ======================================================
// 7. FRONTEND .ENV
// ======================================================

const frontendEnv = path.join(
  FRONTEND,
  ".env"
);

let envContent = "";

if (exists(frontendEnv)) {
  envContent = read(frontendEnv);
}

function ensureEnvVariable(
  content,
  key,
  value
) {
  const regex = new RegExp(
    `^${key}=.*$`,
    "m"
  );

  if (regex.test(content)) {
    return content.replace(
      regex,
      `${key}=${value}`
    );
  }

  return (
    content.replace(/\s*$/, "") +
    `\n${key}=${value}\n`
  );
}

envContent = ensureEnvVariable(
  envContent,
  "VITE_API_URL",
  "http://localhost:5000/api"
);

envContent = ensureEnvVariable(
  envContent,
  "VITE_API_ORIGIN",
  "http://localhost:5000"
);

if (!exists(frontendEnv)) {
  write(frontendEnv, envContent);
  console.log("✓ Created: frontend/.env");
} else {
  backup(frontendEnv);
  write(frontendEnv, envContent);
  console.log("✓ Updated: frontend/.env");
}

// ======================================================
// 8. VITE CONFIG
// ======================================================

const viteConfig = path.join(
  FRONTEND,
  "vite.config.js"
);

const viteConfigContent = `import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(
    mode,
    process.cwd(),
    ""
  );

  const apiOrigin =
    env.VITE_API_ORIGIN ||
    "http://localhost:5000";

  const replaceLocalApiOrigin = {
    name: "replace-local-api-origin",

    transform(code, id) {
      if (
        id.includes("node_modules") ||
        (!id.endsWith(".js") &&
          !id.endsWith(".jsx") &&
          !id.endsWith(".ts") &&
          !id.endsWith(".tsx"))
      ) {
        return null;
      }

      if (
        !code.includes(
          "http://localhost:5000"
        )
      ) {
        return null;
      }

      return {
        code: code.replaceAll(
          "http://localhost:5000",
          apiOrigin
        ),
        map: null,
      };
    },
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      replaceLocalApiOrigin,
    ],
  };
});
`;

if (exists(viteConfig)) {
  const current = read(viteConfig);

  if (
    !current.includes(
      "replace-local-api-origin"
    )
  ) {
    backup(viteConfig);
    write(
      viteConfig,
      viteConfigContent
    );

    console.log(
      "✓ Updated: frontend/vite.config.js"
    );
  } else {
    console.log(
      "✓ Already OK: frontend/vite.config.js"
    );
  }
} else {
  write(
    viteConfig,
    viteConfigContent
  );

  console.log(
    "✓ Created: frontend/vite.config.js"
  );
}

// ======================================================
// FINISHED
// ======================================================

console.log("\n========================================");
console.log(" DEPLOYMENT PREPARATION COMPLETE");
console.log("========================================\n");

console.log(
  `Backup created at:\n${BACKUP}\n`
);

console.log("Next steps:");
console.log(
  "1. npm install inside backend"
);
console.log(
  "2. npm run build inside frontend"
);
console.log(
  "3. Test backend with npm start"
);
console.log(
  "4. Then we will configure GitHub + Render + Vercel"
);

console.log(
  "\n⚠️ Do NOT commit any .env file to GitHub.\n"
);