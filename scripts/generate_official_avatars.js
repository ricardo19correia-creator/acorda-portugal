const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const TARGET_DIR = path.resolve('public/images/avatars');
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 3 Gemini generated images already in artifact dir
const ARTIFACT_DIR = 'C:\\Users\\Riky Moreira\\.gemini\\antigravity\\brain\\485f2fa0-8a42-4177-99e0-e7e7dda37ce3';
const GEMINI_AVATARS = [
  { id: 'avatar_01', file: 'avatar_01_1788309535491.jpg' },
  { id: 'avatar_02', file: 'avatar_02_1788309558974.jpg' },
  { id: 'avatar_03', file: 'avatar_03_1788309573389.jpg' }
];

const AVATAR_SPECS = [
  {
    id: 'avatar_04',
    name: 'A Competidora',
    prompt: '3D stylized gaming avatar portrait of a fierce Portuguese female competitor in her mid 20s, boxer braids, athletic sports gear with subtle red and green accents, neutral dark studio background, cinematic studio lighting with subtle rim light, premium mobile game character portrait, bust shot, centered',
    seed: 104
  },
  {
    id: 'avatar_05',
    name: 'O Mestre',
    prompt: '3D stylized gaming avatar portrait of a distinguished Portuguese scholar man in his late 40s, neat salt-and-pepper short hair, well-groomed grey beard, vintage round metal glasses, dark charcoal smart vest, dignified warm smile, neutral dark studio background, cinematic lighting, premium mobile game character portrait, bust shot, centered',
    seed: 105
  },
  {
    id: 'avatar_06',
    name: 'A Gamer',
    prompt: '3D stylized gaming avatar portrait of a cool female gamer in her early 20s, stylish asymmetrical bob cut with cyan neon hair streaks, modern gaming headset with glowing LED ear cups, dark futuristic hoodie, confident smirk, neutral dark studio background, subtle cyan rim light, premium mobile game character portrait, bust shot, centered',
    seed: 106
  },
  {
    id: 'avatar_07',
    name: 'O Descontraído',
    prompt: '3D stylized gaming avatar portrait of a friendly relaxed young man in his early 20s, warm brown skin, natural textured curly hair, bright confident smile, stylish urban burgundy hoodie, neutral dark studio background, cinematic warm lighting, premium mobile game character portrait, bust shot, centered',
    seed: 107
  },
  {
    id: 'avatar_08',
    name: 'A Visionária',
    prompt: '3D stylized gaming avatar portrait of an elegant futuristic woman in her 30s, dark skin, braided crown bun hairstyle, minimalist smart glasses with subtle amber holographic reflection, sophisticated dark grey blazer, confident visionary expression, neutral dark studio background, cinematic studio lighting, premium mobile game character portrait, bust shot, centered',
    seed: 108
  },
  {
    id: 'avatar_09',
    name: 'O Rebelde',
    prompt: '3D stylized gaming avatar portrait of a bold urban rebel man in his late 20s, textured dark undercut hairstyle, black leather biker jacket with metallic zipper, discreet stud earring, confident intense gaze, neutral dark studio background, moody cinematic rim lighting, premium mobile game character portrait, bust shot, centered',
    seed: 109
  },
  {
    id: 'avatar_10',
    name: 'A Investigadora',
    prompt: '3D stylized gaming avatar portrait of a sharp female detective in her late 20s, olive skin, straight dark brown hair, sleek black turtleneck sweater, analytical observant gaze, neutral dark studio background, subtle teal rim light, premium mobile game character portrait, bust shot, centered',
    seed: 110
  },
  {
    id: 'avatar_11',
    name: 'O Desportista',
    prompt: '3D stylized gaming avatar portrait of an athletic Portuguese male sports star in his early 20s, tanned skin, neat fade haircut, competitive energetic expression, modern sports jersey with discreet red and green accents, neutral dark studio background, cinematic studio lighting, premium mobile game character portrait, bust shot, centered',
    seed: 111
  },
  {
    id: 'avatar_12',
    name: 'A Artista',
    prompt: '3D stylized gaming avatar portrait of a creative Portuguese female artist in her mid 20s, voluminous curly auburn hair, stylish black contemporary beret, expressive poetic gaze, dark plum scarf, neutral dark studio background, soft artistic studio lighting, premium mobile game character portrait, bust shot, centered',
    seed: 112
  },
  {
    id: 'avatar_13',
    name: 'O Professor',
    prompt: '3D stylized gaming avatar portrait of a charismatic intellectual university professor in his early 50s, wavy salt-and-pepper hair, neat mustache, knit tie and modern corduroy blazer, welcoming charismatic smile, neutral dark studio background, warm cinematic lighting, premium mobile game character portrait, bust shot, centered',
    seed: 113
  },
  {
    id: 'avatar_14',
    name: 'A Aventureira',
    prompt: '3D stylized gaming avatar portrait of a fearless female explorer in her mid 20s, sun-kissed skin, high textured ponytail, tactical outdoor jacket, wind scarf, daring confident smile, neutral dark studio background, dramatic rim lighting, premium mobile game character portrait, bust shot, centered',
    seed: 114
  },
  {
    id: 'avatar_15',
    name: 'O Técnico',
    prompt: '3D stylized gaming avatar portrait of an analytical male tech engineer in his late 20s, clean side-parted dark hair, modern slim titanium frame eyeglasses, tech high-collar jacket, calm observant expression, neutral dark studio background, cool blue cinematic lighting, premium mobile game character portrait, bust shot, centered',
    seed: 115
  },
  {
    id: 'avatar_16',
    name: 'A Estratega',
    prompt: '3D stylized gaming avatar portrait of a calm calculating female grandmaster in her early 30s, sleek modern pixie haircut, sharp focused eyes, navy blue structured blazer, minimalist smart earpiece, neutral dark studio background, cinematic edge lighting, premium mobile game character portrait, bust shot, centered',
    seed: 116
  },
  {
    id: 'avatar_17',
    name: 'O Visionário',
    prompt: '3D stylized gaming avatar portrait of a futuristic visionary innovator man in his late 30s, black skin, sharp fade haircut, minimalist collarless charcoal tech coat, confident visionary gaze, neutral dark studio background, amber and violet rim lighting, premium mobile game character portrait, bust shot, centered',
    seed: 117
  },
  {
    id: 'avatar_18',
    name: 'A Campeã',
    prompt: '3D stylized gaming avatar portrait of a triumphant female champion in her late 20s, athletic olive skin, sleek side braid, subtle golden laurel collar accent, podium athletic jacket, radiant victorious expression, neutral dark studio background, golden rim lighting, premium mobile game character portrait, bust shot, centered',
    seed: 118
  },
  {
    id: 'avatar_19',
    name: 'O Curioso',
    prompt: '3D stylized gaming avatar portrait of a curious youthful student in his early 20s, light freckles, tousled reddish-brown hair, sharp inquisitive eyes, mustard yellow crewneck sweater, neutral dark studio background, warm studio lighting, premium mobile game character portrait, bust shot, centered',
    seed: 119
  },
  {
    id: 'avatar_20',
    name: 'A Investigadora Urbana',
    prompt: '3D stylized gaming avatar portrait of a modern female urban investigator in her late 20s, medium brown skin, shoulder-length wavy hair, stylish dark trench coat with subtle geometric Portuguese azulejo collar pattern, observant expression, neutral dark studio background, cinematic lighting, premium mobile game character portrait, bust shot, centered',
    seed: 120
  },
  {
    id: 'avatar_21',
    name: 'O Capitão',
    prompt: '3D stylized gaming avatar portrait of a seasoned sea captain in his early 40s, weathered tanned skin, dark hair with silver temples, neat full beard, navy blue maritime pea coat with brass buttons, commanding leadership gaze, neutral dark studio background, cinematic lighting, premium mobile game character portrait, bust shot, centered',
    seed: 121
  },
  {
    id: 'avatar_22',
    name: 'A Criativa',
    prompt: '3D stylized gaming avatar portrait of an energetic young female creative in her early 20s, two-tone pastel and dark hair with micro braids, vibrant colorful patterned sweater, enthusiastic smiling expression, neutral dark studio background, bright studio lighting, premium mobile game character portrait, bust shot, centered',
    seed: 122
  },
  {
    id: 'avatar_23',
    name: 'O Minimalista',
    prompt: '3D stylized gaming avatar portrait of a sleek modern minimalist man in his late 20s, clean buzz cut, premium matte black crewneck shirt, serene calm gaze, elegant understated aesthetic, neutral dark studio background, soft diffuse lighting, premium mobile game character portrait, bust shot, centered',
    seed: 123
  },
  {
    id: 'avatar_24',
    name: 'A Challenger',
    prompt: '3D stylized gaming avatar portrait of an irreverent female challenger in her early 20s, dark skin, stylish double afro puffs, vibrant neon trim bomber jacket, daring competitive smirk, neutral dark studio background, magenta and cyan edge lighting, premium mobile game character portrait, bust shot, centered',
    seed: 124
  },
  {
    id: 'avatar_25',
    name: 'O Geek',
    prompt: '3D stylized gaming avatar portrait of a passionate tech enthusiast man in his early 20s, dark curly hair, bold black-rimmed eyeglasses, tech graphic sweatshirt, playful intelligent smile, neutral dark studio background, cinematic lighting, premium mobile game character portrait, bust shot, centered',
    seed: 125
  },
  {
    id: 'avatar_26',
    name: 'A Analista',
    prompt: '3D stylized gaming avatar portrait of a sophisticated female data analyst in her early 30s, olive skin, immaculate high bun hairstyle, modern dark executive blazer with satin lapel, sharp analytical gaze, neutral dark studio background, cool crisp lighting, premium mobile game character portrait, bust shot, centered',
    seed: 126
  },
  {
    id: 'avatar_27',
    name: 'O Comunicador',
    prompt: '3D stylized gaming avatar portrait of a charismatic male podcast host/speaker in his late 20s, warm tan skin, neat pompadour fade, warm engaging smile, relaxed open collar shirt, discreet lavalier pin, neutral dark studio background, warm key lighting, premium mobile game character portrait, bust shot, centered',
    seed: 127
  },
  {
    id: 'avatar_28',
    name: 'A Exploradora Digital',
    prompt: '3D stylized gaming avatar portrait of a cutting-edge female digital navigator in her mid 20s, platinum blonde layered hair, translucent sleek AR smart visor glasses, modern techwear jacket with subtle neon seams, adventurous look, neutral dark studio background, cyber rim light, premium mobile game character portrait, bust shot, centered',
    seed: 128
  },
  {
    id: 'avatar_29',
    name: 'O Mestre do Quiz',
    prompt: '3D stylized gaming avatar portrait of an enigmatic quizmaster in his mid 30s, trimmed goatee, wavy dark hair, deep burgundy velvet vest with a small golden Quinas heraldic pin, witty knowing smile, neutral dark studio background, dramatic studio spotlighting, premium mobile game character portrait, bust shot, centered',
    seed: 129
  },
  {
    id: 'avatar_30',
    name: 'A Rainha do Ranking',
    prompt: '3D stylized gaming avatar portrait of a majestic leaderboard queen in her late 20s, bronze skin, long silky dark hair, minimalist platinum circlet tiara, royal velvet dark cape, proud commanding expression, neutral dark studio background, ethereal golden aura lighting, premium mobile game character portrait, bust shot, centered',
    seed: 130
  },
  {
    id: 'avatar_31',
    name: 'O Veterano',
    prompt: '3D stylized gaming avatar portrait of a venerable grandmaster veteran in his late 50s, distinguished facial character lines, brushed back silver hair, immaculate silver beard, dark wool coat with high collar, wise respected gaze, neutral dark studio background, dramatic portrait lighting, premium mobile game character portrait, bust shot, centered',
    seed: 131
  },
  {
    id: 'avatar_32',
    name: 'A Nova Geração',
    prompt: '3D stylized gaming avatar portrait of a vibrant young-adult girl in her late teens, fair skin with light freckles, casual ponytail with bangs, oversized pastel graphic hoodie, headphones resting on neck, joyful energetic smile, neutral dark studio background, bright dynamic studio lighting, premium mobile game character portrait, bust shot, centered',
    seed: 132
  },
  {
    id: 'avatar_33',
    name: 'O Campeão',
    prompt: '3D stylized gaming avatar portrait of a powerhouse male champion in his late 20s, athletic build, bronze skin, clean fade hairstyle, golden champion emblem engraved on collar, fierce victorious expression, neutral dark studio background, heroic golden rim lighting, premium mobile game character portrait, bust shot, centered',
    seed: 133
  },
  {
    id: 'avatar_34',
    name: 'A Lenda',
    prompt: '3D stylized gaming avatar portrait of a mythical legendary Portuguese heroine in her 30s, noble porcelain skin, voluminous wavy hazelnut hair, dark ceremonial cape with intricate gold filigree embroidery, captivating aura, neutral dark studio background, mystical golden rim light, premium mobile game character portrait, bust shot, centered',
    seed: 134
  },
  {
    id: 'avatar_35',
    name: 'O Desafiante',
    prompt: '3D stylized gaming avatar portrait of an intense young challenger man in his mid 20s, olive skin, textured spiky hair, angular duel combat jacket with crimson trim, fierce competitive warrior gaze, neutral dark studio background, intense red and dark blue lighting, premium mobile game character portrait, bust shot, centered',
    seed: 135
  },
  {
    id: 'avatar_36',
    name: 'A Lenda Portuguesa',
    prompt: '3D stylized gaming avatar portrait of a noble heroic Portuguese legendary knight in ceremonial gala plate armor with the Cross of Christ and Quinas heraldic gold emblem, noble determined face, golden armillary sphere ambient glow in the background, neutral dark studio background, cinematic epic lighting, premium mobile game character portrait, bust shot, centered',
    seed: 136
  }
];

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    function get(u) {
      https.get(u, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error('HTTP ' + res.statusCode + ' for ' + u));
        }
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => resolve());
        fileStream.on('error', err => reject(err));
      }).on('error', err => reject(err));
    }
    get(url);
  });
}

async function main() {
  console.log('--- ETAPA 1: Processar avatares 01, 02, 03 do Gemini ---');
  for (const item of GEMINI_AVATARS) {
    const srcPath = path.join(ARTIFACT_DIR, item.file);
    const destPath = path.join(TARGET_DIR, item.id + '.png');
    if (fs.existsSync(srcPath)) {
      console.log('Convertendo ' + item.id + ' de ' + srcPath + '...');
      await sharp(srcPath)
        .resize(512, 512, { fit: 'cover', position: 'center' })
        .png({ quality: 90 })
        .toFile(destPath);
      console.log('✅ ' + item.id + '.png criado com sucesso.');
    } else {
      console.error('❌ Imagem do Gemini não encontrada: ' + srcPath);
    }
  }

  console.log('\n--- ETAPA 2: Gerar avatares 04 a 36 via Pollinations ---');
  for (let i = 0; i < AVATAR_SPECS.length; i++) {
    const spec = AVATAR_SPECS[i];
    const destPng = path.join(TARGET_DIR, spec.id + '.png');
    const tempJpg = path.join(TARGET_DIR, 'temp_' + spec.id + '.jpg');

    if (fs.existsSync(destPng) && fs.statSync(destPng).size > 15000) {
      console.log('⏩ ' + spec.id + '.png já existe e é válido (' + spec.name + '). Saltando...');
      continue;
    }

    console.log('[[' + (i + 1) + '/' + AVATAR_SPECS.length + ']] Gerando ' + spec.id + ' — ' + spec.name + '...');
    const encodedPrompt = encodeURIComponent(spec.prompt);
    const url = 'https://image.pollinations.ai/prompt/' + encodedPrompt + '?width=512&height=512&nologo=true&seed=' + spec.seed;

    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await downloadImage(url, tempJpg);
        // Process with Sharp to 512x512 PNG
        await sharp(tempJpg)
          .resize(512, 512, { fit: 'cover', position: 'center' })
          .png({ quality: 90 })
          .toFile(destPng);
        
        // Cleanup temp file
        if (fs.existsSync(tempJpg)) fs.unlinkSync(tempJpg);
        
        const size = fs.statSync(destPng).size;
        console.log('  ✅ ' + spec.id + '.png (' + spec.name + ') gerado (' + Math.round(size / 1024) + ' KB)');
        success = true;
        break;
      } catch (err) {
        console.warn('  ⚠️ Tentativa ' + attempt + ' falhou para ' + spec.id + ': ' + err.message);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!success) {
      console.error('❌ Falha crítica ao gerar ' + spec.id + ' (' + spec.name + ')');
    }

    // Intervalo de cortesia para a API
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('\n--- ETAPA 3: Auditoria dos 36 Avatares Físicos ---');
  let validCount = 0;
  for (let n = 1; n <= 36; n++) {
    const id = 'avatar_' + n.toString().padStart(2, '0');
    const p = path.join(TARGET_DIR, id + '.png');
    if (fs.existsSync(p)) {
      const meta = await sharp(p).metadata();
      const bytes = fs.statSync(p).size;
      if (meta.width === 512 && meta.height === 512 && bytes > 10000) {
        validCount++;
      } else {
        console.warn('  ⚠️ ' + id + '.png dimensões/tamanho inválido: ' + meta.width + 'x' + meta.height + ', ' + bytes + ' bytes');
      }
    } else {
      console.error('  ❌ ' + id + '.png não existe!');
    }
  }

  console.log('\n🎉 Total de Avatares Válidos: ' + validCount + ' / 36');
}

main().catch(console.error);