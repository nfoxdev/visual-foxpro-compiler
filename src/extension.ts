import * as vscode from 'vscode';
import { execFile } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('Visual Foxpro Compiler extension activated!');
    console.log(`context.extensionPath: ${context.extensionPath}`);

    // Crear un canal de salida
    const outputChannel = vscode.window.createOutputChannel('Visual FoxPro Compiler');

    let disposable = vscode.workspace.onDidSaveTextDocument((document) => {
        if (!document.fileName.endsWith('.prg')) {
            return;
        }

        console.log(`Saved file: ${document.fileName}`);
        const filePath = document.fileName;
        const compilerPath = path.join(context.extensionPath, 'bin', 'visual-foxpro-compiler.exe');
        const errorFilePath = path.join(path.dirname(filePath), path.basename(filePath, '.prg') + '.err');

        execFile(compilerPath, [filePath], async (error, stdout, stderr) => {
            // Registrar en el canal de salida
            outputChannel.appendLine(`Compile ${path.basename(filePath)}:`);

            // Manejar errores del ejecutable
            if (error) {
                const errorMessage = `Error running compiler: ${error.message}${stderr ? `\n${stderr}` : ''}`;
                console.error(errorMessage);
                outputChannel.appendLine(errorMessage);
                outputChannel.appendLine('---');
                vscode.window.showErrorMessage('Error running the compiler.');
                outputChannel.show(true);
                return;
            }

            // Verificar si existe el archivo .err
            if (fs.existsSync(errorFilePath)) {
                try {
                    vscode.window.setStatusBarMessage('Compilation error(s) found!',5000);
                    // Registrar en el canal de salida
                    outputChannel.appendLine(`Compilation error:`);
                    outputChannel.appendLine(fs.readFileSync(errorFilePath, 'utf8'));
                    outputChannel.appendLine('---');
                    outputChannel.show(true);

                    // Opcional: Borrar el archivo .err después de mostrarlo
                    fs.unlinkSync(errorFilePath);
                } catch (err) {
                    const errorMessage = `Error opening error file: ${(err as Error).message}`;
                    console.error(errorMessage);
                    outputChannel.appendLine(errorMessage);
                    outputChannel.appendLine('---');
                    vscode.window.showErrorMessage('Error opening the error file.');
                    outputChannel.show(true);
                }
            } else {
                // Compilación exitosa
                console.log('File Compiled OK!',5000);
                outputChannel.appendLine('File compiled ok');
                outputChannel.appendLine('---');
                vscode.window.setStatusBarMessage('File Compiled Ok',10000);
            }
        });
    });

    context.subscriptions.push(disposable, outputChannel);
}

export function deactivate() {
    console.log('Disabled extension.');
}