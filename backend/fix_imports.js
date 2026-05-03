const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ JwtAuthGuard \} from '\.\.\/auth\/guards\/jwt-auth\.guard';/g, "import { JwtAuthGuard } from '../auth/guards/jwt.guard';");
  content = content.replace(/import \{ RolesGuard \} from '\.\.\/auth\/guards\/roles\.guard';/g, "import { RolesGuard } from '../auth/guards/role.guard';");
  fs.writeFileSync(file, content, 'utf8');
}

const controllers = [
  './src/dapur/dapur.controller.ts',
  './src/sekolah/sekolah.controller.ts',
  './src/kelas/kelas.controller.ts',
  './src/admin-users/admin-users.controller.ts'
];

controllers.forEach(fixFile);

let mainContent = fs.readFileSync('./src/main.ts', 'utf8');
mainContent = mainContent.replace(/\u0000/g, ''); // strip null bytes
mainContent = mainContent.trim();
fs.writeFileSync('./src/main.ts', mainContent + '\\n', 'utf8');
