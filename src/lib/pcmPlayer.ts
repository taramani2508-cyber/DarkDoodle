export async function playPcm(base64Data: string, sampleRate: number = 24000) {
  try {
    const audioContent = atob(base64Data);
    const buffer = new ArrayBuffer(audioContent.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < audioContent.length; i++) {
      view[i] = audioContent.charCodeAt(i);
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Convert 16-bit PCM to Float32
    const pcm16 = new Int16Array(buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
    }

    const audioBuffer = audioContext.createBuffer(1, float32.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    
    return source;
  } catch (error) {
    console.error("PCM Playback Error:", error);
    return null;
  }
}
