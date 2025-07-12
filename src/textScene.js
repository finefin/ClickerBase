const sampleText = `Click to spawn
spawn to make
make to own
own to upgrade
upgrade to make more...`;

const textBlob = new Blob([sampleText], {
    type: 'text/plain'
});
const textUrl = URL.createObjectURL(textBlob);

export default class TextScene extends Phaser.Scene {
    constructor() {
                super({ key: 'TextScene' });
                this.textLines = [];
                this.currentLineIndex = 0;
            }

            preload() {
                this.load.text('textfile', textUrl);
            }

            create() {
                // Hole den Textinhalt
                const textContent = this.cache.text.get('textfile');
                this.textLines = textContent.split('\n').filter(line => line.trim() !== '');
                console.log (textContent);


                // Starte die Animation
                this.showNextLine();
            }

            showNextLine() {
                if (this.currentLineIndex >= this.textLines.length) {
                    // Alle Zeilen wurden angezeigt, starte von vorne
                    this.currentLineIndex = 0;
                    
                    // Warte 2 Sekunden, dann beginne von neuem
                    this.time.delayedCall(2000, () => {
                        //this.showNextLine();
                    });
                    return;
                }

                const line = this.textLines[this.currentLineIndex];
                const width = this.cameras.main.width;
                const height = this.cameras.main.height;
                
                // Erstelle den Text zentriert auf dem Bildschirm
                const textObject = this.add.text(width / 2, height / 2, line, {
                    font: '32px Arial',
                    fill: '#ffffff',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 2,
                    wordWrap: { width: width - 100 }
                });
                
                textObject.setOrigin(0.5, 0.5);
                
                // Starte unsichtbar und klein
                textObject.setScale(0.2);
                textObject.setAlpha(0);
                
                // Phase 1: Fade In + Größer werden
                this.tweens.add({
                    targets: textObject,
                    scale: {from: 0, to: 2},
                    alpha: 1,
                    duration: 10000,
                    ease: 'Linear',
                    onComplete: () => {
                        // Phase 2: Kurz halten und weiter wachsen
                        this.tweens.add({
                            targets: textObject,
                            scale: {from: 2, to: 4},
                            duration: 10000,
                            ease: 'Linear',
                            onComplete: () => {
                                // Phase 3: Fade Out
                                this.tweens.add({
                                    targets: textObject,
                                    alpha: 0,
                                    scale: {from: 4, to: 8},
                                    duration: 10000,
                                    ease: 'Linear',
                                    onComplete: () => {
                                        // Entferne den Text und zeige die nächste Zeile
                                        textObject.destroy();
                                        this.currentLineIndex++;
                                        this.showNextLine();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }