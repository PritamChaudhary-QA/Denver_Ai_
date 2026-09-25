import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini SDK with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Simulated/dynamic real-time system stats endpoint
app.get('/api/system/stats', (_req: Request, res: Response) => {
  const time = Date.now();
  // Generate realistic smooth oscillating metrics for telemetry HUD
  const cpu = Math.round(14 + Math.sin(time / 4000) * 8 + Math.cos(time / 1500) * 4);
  const memUsed = +(4.2 + Math.sin(time / 8000) * 0.8).toFixed(1);
  const gpu = Math.round(18 + Math.cos(time / 5000) * 10);
  const netDown = +(24.5 + Math.sin(time / 3000) * 12).toFixed(1);
  const netUp = +(8.2 + Math.cos(time / 3500) * 4).toFixed(1);

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    metrics: {
      cpu: Math.max(5, Math.min(95, cpu)),
      memory: {
        usedGB: memUsed,
        totalGB: 16.0,
        percentage: Math.round((memUsed / 16.0) * 100),
      },
      gpu: Math.max(5, Math.min(98, gpu)),
      network: {
        downloadMbps: Math.max(0.5, netDown),
        uploadMbps: Math.max(0.2, netUp),
      },
      os: 'Windows 11 Pro 64-bit',
      activeProfile: 'Pritam (Administrator)',
      security: {
        e2eEncryption: 'AES-256-GCM',
        vaultLocked: false,
      },
    },
  });
});

// Chat & System Command NLP execution endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, history, context } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const promptText = message.trim();

  // Denver System Persona & Action Prompt
  const systemInstruction = `You are Denver (v0.1), an advanced Personal Intelligence and OS Automation Assistant (inspired by Jarvis / Mark-LIII) serving Pritam.
Your capabilities:
1. System & App Automation: launch or control applications (Notepad, Terminal, VS Code, Browser, Spotify, Calculator, Settings), volume up/down/mute, screen brightness, sleep/lock.
2. File System Management: create, read, search, list, summarize, and edit local files.
3. Task Scheduling: schedule tasks, reminders, alarms with real-time timers and notifications.
4. Multitasking & Jarvis intelligence: quick, sharp, precise voice-ready responses. Keep spoken reply concise (1-3 sentences), authoritative, courteous, and high-tech ("Right away, Pritam", "Workspace updated, sir", "Task scheduled").
5. Return structured JSON with:
   - "reply": Spoken text reply suitable for speech synthesis (concise, natural).
   - "action": Optional action object:
     {
       "type": "launch_app" | "file_create" | "file_read" | "file_search" | "schedule_task" | "system_control" | "vision_scan" | "general",
       "target": string (e.g. "Notepad", "task_name", "filename.txt"),
       "details": string,
       "payload": any (e.g. { content: "...", volume: 80, time: "..." })
     }
Always return strictly valid JSON matching this format without markdown code fences if possible.`;

  // Fallback Rule-Based Intelligence for Instant Offline / Low Latency
  const getFallbackResponse = (query: string) => {
    const q = query.toLowerCase();

    // App launching
    if (q.includes('notepad') || q.includes('note')) {
      return {
        reply: "Opening Notepad workspace now, Pritam.",
        action: { type: 'launch_app', target: 'Notepad', details: 'Launched Notepad text editor' }
      };
    }
    if (q.includes('calculator') || q.includes('calc')) {
      return {
        reply: "Launching Calculator tool for you.",
        action: { type: 'launch_app', target: 'Calculator', details: 'Launched Windows Calculator' }
      };
    }
    if (q.includes('terminal') || q.includes('cmd') || q.includes('powershell')) {
      return {
        reply: "Initializing Windows PowerShell console with administrative privileges.",
        action: { type: 'launch_app', target: 'PowerShell', details: 'Launched Terminal' }
      };
    }
    if (q.includes('browser') || q.includes('chrome') || q.includes('google')) {
      return {
        reply: "Opening browser workstation.",
        action: { type: 'launch_app', target: 'Browser', details: 'Launched Web Browser' }
      };
    }
    if (q.includes('code') || q.includes('vs code') || q.includes('vscode')) {
      return {
        reply: "Opening Visual Studio Code environment.",
        action: { type: 'launch_app', target: 'VS Code', details: 'Launched VS Code' }
      };
    }
    if (q.includes('spotify') || q.includes('music')) {
      return {
        reply: "Accessing media core and launching Spotify.",
        action: { type: 'launch_app', target: 'Spotify', details: 'Launched Spotify Player' }
      };
    }

    // System controls
    if (q.includes('volume') || q.includes('sound') || q.includes('mute')) {
      return {
        reply: "Adjusting audio master levels as requested.",
        action: { type: 'system_control', target: 'Audio', details: 'Master volume updated' }
      };
    }
    if (q.includes('cpu') || q.includes('system') || q.includes('status') || q.includes('telemetry') || q.includes('specs')) {
      return {
        reply: "All core systems nominal, Pritam. CPU is running steady at 18%, memory utilization is 4.2 gigabytes, and your workspace encryption is active.",
        action: { type: 'system_control', target: 'Telemetry', details: 'Telemetry scan refreshed' }
      };
    }

    // File commands
    if (q.includes('create file') || q.includes('new file') || q.includes('write file') || q.includes('make file')) {
      const match = query.match(/(?:file|named|called)\s+([a-zA-Z0-9_\-\.]+)/i);
      const filename = match ? match[1] : 'denver_note.txt';
      return {
        reply: `File ${filename} has been created in your local workspace.`,
        action: { type: 'file_create', target: filename, details: `Created ${filename}`, payload: { filename, content: '// Denver AI Workspace File\n// Created: ' + new Date().toISOString() } }
      };
    }
    if (q.includes('files') || q.includes('list file') || q.includes('show file') || q.includes('dir')) {
      return {
        reply: "Displaying your local workspace files and directories now.",
        action: { type: 'file_search', target: 'all', details: 'Listed active files' }
      };
    }

    // Scheduling
    if (q.includes('schedule') || q.includes('remind') || q.includes('alarm') || q.includes('timer')) {
      return {
        reply: "Scheduled task added to Denver active queue. You will receive real-time audio and visual notifications.",
        action: { type: 'schedule_task', target: query, details: 'Task scheduled with real-time alert trigger', payload: { title: query, minutes: 15 } }
      };
    }

    // General intelligent greeting
    if (q.includes('hello') || q.includes('hi') || q.includes('denver') || q.includes('hey')) {
      return {
        reply: "Greetings Pritam. Denver intelligence core is online and ready for your command.",
        action: { type: 'general', target: 'greeting', details: 'System handshake complete' }
      };
    }

    return {
      reply: `Command processed, Pritam. Denver is coordinating the request across your desktop workspace.`,
      action: { type: 'general', target: 'command', details: `Processed: ${query}` }
    };
  };

  if (!ai) {
    // If no API key configured, use built-in smart assistant engine
    const fallback = getFallbackResponse(promptText);
    return res.json({
      success: true,
      model: 'denver-edge-core',
      reply: fallback.reply,
      action: fallback.action,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Context: User is Pritam on Windows OS. Context details: ${JSON.stringify(context || {})}\nHistory: ${JSON.stringify((history || []).slice(-4))}\nUser Input: ${promptText}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '';
    try {
      const parsed = JSON.parse(outputText);
      return res.json({
        success: true,
        model: 'gemini-3.8-flash',
        reply: parsed.reply || outputText,
        action: parsed.action || { type: 'general', target: 'assistant' },
      });
    } catch {
      return res.json({
        success: true,
        model: 'gemini-3.8-flash',
        reply: outputText,
        action: { type: 'general', target: 'assistant' },
      });
    }
  } catch (err: any) {
    console.error('Gemini API call failed, falling back to local Denver engine:', err?.message);
    const fallback = getFallbackResponse(promptText);
    return res.json({
      success: true,
      model: 'denver-fallback-core',
      reply: fallback.reply,
      action: fallback.action,
    });
  }
});

// Provide downloadable / copyable Windows Local Desktop Agent script (Python)
app.get('/api/agent/script/python', (_req: Request, res: Response) => {
  const script = `"""
DENVER AI - Windows Local Desktop Bridge (v0.1)
Run this script on your Windows PC to give Denver direct control over
local applications, Windows PowerShell, files, volume, and system tasks!
Requirements: pip install flask flask-cors
"""
import os
import sys
import subprocess
import webbrowser
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "online",
        "agent": "Denver Windows Local Bridge",
        "version": "0.1",
        "os": "Windows"
    })

@app.route('/exec', methods=['POST'])
def execute():
    data = request.json or {}
    cmd = data.get("command", "")
    target = data.get("target", "")
    action = data.get("action", "")

    if action == "launch":
        apps = {
            "notepad": "notepad.exe",
            "calculator": "calc.exe",
            "cmd": "start cmd.exe",
            "powershell": "powershell.exe",
            "code": "code",
            "chrome": "start chrome",
            "spotify": "start spotify:",
            "explorer": "explorer.exe"
        }
        target_lower = target.lower()
        if target_lower in apps:
            subprocess.Popen(apps[target_lower], shell=True)
            return jsonify({"success": True, "message": f"Launched {target}"})
        else:
            subprocess.Popen(target, shell=True)
            return jsonify({"success": True, "message": f"Executed {target}"})

    elif action == "powershell":
        result = subprocess.run(["powershell", "-Command", cmd], capture_output=True, text=True)
        return jsonify({"stdout": result.stdout, "stderr": result.stderr, "code": result.returncode})

    return jsonify({"success": True, "echo": data})

if __name__ == '__main__':
    print("==================================================")
    print("  DENVER AI - WINDOWS LOCAL AGENT LISTENING ON 8765")
    print("  Pairing ready with Denver Web Workspace")
    print("==================================================")
    app.run(host='127.0.0.1', port=8765)
`;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="denver_agent.py"');
  res.send(script);
});

// Provide Windows PowerShell one-liner script
app.get('/api/agent/script/powershell', (_req: Request, res: Response) => {
  const script = `# Denver AI PowerShell Local Bridge
Write-Host "Denver AI - Windows PowerShell Bridge Initializing..." -ForegroundColor Cyan
# Start simple local listener on 8765
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8765/")
$listener.Start()
Write-Host "Denver Desktop Agent active on http://localhost:8765/" -ForegroundColor Green
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $response = $context.Response
    $response.Headers.Add("Access-Control-Allow-Origin", "*")
    $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
    if ($context.Request.HttpMethod -eq "OPTIONS") {
        $response.StatusCode = 200
        $response.Close()
        continue
    }
    $responseString = '{"status":"online","agent":"Denver PowerShell Native Bridge"}'
    $buffer = [System.Text.Encoding]::UTF8.GetBytes($responseString)
    $response.ContentLength64 = $buffer.Length
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
    $response.OutputStream.Close()
}
`;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="denver_agent.ps1"');
  res.send(script);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In prod, serve dist static files
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Denver AI Core Server running on port ${PORT}`);
  });
}

startServer();
