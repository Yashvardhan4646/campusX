import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { code, language } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Only support JavaScript for now (basic implementation)
    if (language === 'javascript' || language === 'js') {
      try {
        let output = [];
        let logCapture = '';
        
        // Create a sandboxed console
        const sandboxConsole = {
          log: (...args) => {
            output.push(args.map(arg => {
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(arg);
                }
              }
              return String(arg);
            }).join(' '));
          },
          error: (...args) => {
            output.push('❌ ' + args.map(String).join(' '));
          },
          warn: (...args) => {
            output.push('⚠️ ' + args.map(String).join(' '));
          },
          info: (...args) => {
            output.push('ℹ️ ' + args.map(String).join(' '));
          }
        };

        // Wrap code to capture console.log and return values
        const wrappedCode = `
          const __output = [];
          const console = {
            log: (...args) => __output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            error: (...args) => __output.push('❌ ' + args.map(String).join(' ')),
            warn: (...args) => __output.push('⚠️ ' + args.map(String).join(' ')),
            info: (...args) => __output.push('ℹ️ ' + args.map(String).join(' '))
          };
          ${code}
          return __output;
        `;

        // Execute with timeout
        const timeout = 5000;
        let result;
        let error;
        
        try {
          const fn = new Function(wrappedCode);
          const startTime = Date.now();
          result = fn();
          
          if (Date.now() - startTime > timeout) {
            throw new Error('Execution timeout (max 5 seconds)');
          }
        } catch (e) {
          error = e.message;
        }

        return NextResponse.json({
          success: !error,
          output: result || [],
          error: error || null,
          language
        });

      } catch (err) {
        return NextResponse.json({
          success: false,
          output: [],
          error: err.message,
          language
        });
      }
    }

    // For other languages, return a message
    return NextResponse.json({
      success: false,
      output: [],
      error: `Language "${language}" execution not supported yet. Only JavaScript is available.`,
      language
    });

  } catch (error) {
    console.error('[Code Execution Error]', error);
    return NextResponse.json({ 
      success: false,
      output: [],
      error: 'Execution failed',
      language: 'unknown'
    }, { status: 500 });
  }
}
