export type LiveSessionCallbacks = {
  onAudioData: (base64Pcm: string) => void;
  onTranscript: (text: string) => void;
  onUserTranscript?: (text: string) => void; // Added for User's own voice
  onTurnComplete: () => void;
  onConnected: () => void;
  onSetupComplete: () => void;
  onError: (error: Error) => void;
  onClosed: () => void;
};

export class GeminiLiveSession {
  private ws: WebSocket | null = null;
  private token: string;
  public callbacks: LiveSessionCallbacks;
  private isSetup = false;

  constructor(token: string, callbacks: LiveSessionCallbacks) {
    this.token = token;
    this.callbacks = callbacks;
  }

  connect(systemInstruction: string) {
    // Note: The experimental-2.0-flash model usually lives on the v1beta endpoint for the live socket
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.callbacks.onConnected();
      
      const setupMsg = {
        setup: {
          model: "models/gemini-3.1-flash-live-preview",
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Kore" // Using a standard known voice for 3.x
                }
              }
            }
          },
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          }
        }
      };
      
      console.log("📤 Sending Setup Message (Simplified)...", setupMsg);
      this.ws?.send(JSON.stringify(setupMsg));
    };

    this.ws.onmessage = async (event) => {
      try {
        let msgStr = event.data;
        if (event.data instanceof Blob) {
          msgStr = await event.data.text();
        }
        
        const msg = JSON.parse(msgStr);
        console.log("📥 Received from Gemini:", Object.keys(msg)[0], msg);

        // Protocol Step: Wait for setupComplete
        if (msg.setupComplete) {
          console.log("✅ Setup Complete!");
          this.isSetup = true;
          this.callbacks.onSetupComplete();
          return;
        }

        // Handle errors if they come through the stream
        if (msg.error) {
          console.error("❌ Gemini API Stream Error:", msg.error);
          this.callbacks.onError(new Error(msg.error.message || "API Error"));
          // Disconnect on error to avoid hanging
          this.disconnect();
          return;
        }

        // Extract audio chunks from modelTurn
        if (msg.serverContent?.modelTurn?.parts) {
          const parts = msg.serverContent.modelTurn.parts;
          for (const part of parts) {
            if (part.inlineData?.data) {
              this.callbacks.onAudioData(part.inlineData.data);
            }
            // Some models also embed text here — forward as transcript
            if (part.text) {
              this.callbacks.onTranscript(part.text);
            }
          }
        }

        // outputAudioTranscription delivers the GM's speech-to-text here
        if (msg.serverContent?.outputTranscription?.text) {
          this.callbacks.onTranscript(msg.serverContent.outputTranscription.text);
        }

        // Did the model finish speaking its turn?
        if (msg.serverContent?.turnComplete) {
          this.callbacks.onTurnComplete();
        }

      } catch (err) {
        console.warn("Failed to parse Gemini message", err);
      }
    };

    this.ws.onerror = (evt) => {
      console.error("Live API WebSocket Error:", evt);
      this.callbacks.onError(new Error("WebSocket Error"));
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log(`🔴 Connection closed. Code: ${event.code}, Reason: ${event.reason || "No reason given"}`);
      this.isSetup = false;
      this.callbacks.onClosed();
    };
  }

  sendUserMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isSetup) {
      console.warn("WebSocket is not ready or configured. Cannot send message.");
      return;
    }

    // For Gemini 3.x live models, send text via realtimeInput
    const msg = {
      realtimeInput: {
        text
      }
    };
    
    console.log("📤 Sending user message:", JSON.stringify(msg));
    this.ws.send(JSON.stringify(msg));
  }

  sendAudioChunk(data: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isSetup) return;
    
    // Send raw PCM as realtimeInput
    const msg = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: "audio/pcm;rate=16000",
          data
        }]
      }
    };
    
    this.ws.send(JSON.stringify(msg));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
