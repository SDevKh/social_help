import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import normalizeWheel from "normalize-wheel";

// Shaders defined as inline template strings
const vertexShader = `
varying vec2 vUv;
varying float vVisibility;
varying float vDepth;
varying vec4 vTextureCoords;

attribute vec3 aInitialPosition;
attribute float aMeshSpeed;
attribute vec4 aTextureCoords;

uniform float uTime;
uniform vec2 uMaxXdisplacement;
uniform vec2 uDrag;
uniform float uScrollY;

float remap(float value, float originMin, float originMax)
{
    return clamp((value - originMin) / (originMax - originMin), 0.0, 1.0);
}

void main()
{     
    vec3 newPosition = position + aInitialPosition;

    float maxX = uMaxXdisplacement.x;
    float maxY = uMaxXdisplacement.y;

    float maxYoffset = distance(aInitialPosition.y, maxY);
    float minYoffset = distance(aInitialPosition.y, -maxY);
    
    float maxXoffset = distance(aInitialPosition.x, maxX);
    float minXoffset = distance(aInitialPosition.x, -maxX);
    
    // Smooth wrapping scroll effect on X, Y and Z axes
    float xDisplacement = mod(minXoffset - uDrag.x + uTime * aMeshSpeed, maxXoffset + minXoffset) - minXoffset;
    float yDisplacement = mod(minYoffset - uDrag.y, maxYoffset + minYoffset) - minYoffset;
    
    float maxZ = 12.0;
    float minZ = -30.0;
    
    float maxZoffset = distance(aInitialPosition.z, maxZ);    
    float minZoffset = distance(aInitialPosition.z, minZ);    
    
    float zDisplacement = mod(uScrollY + minZoffset, maxZoffset + minZoffset) - minZoffset;    
    
    newPosition.x += xDisplacement; 
    newPosition.y += yDisplacement;
    newPosition.z += zDisplacement;

    // Fade out far away cards in the background
    vVisibility = remap(newPosition.z, minZ, minZ + 8.0);
    
    // Depth-of-field blur factor (closer is sharper, further is blurrier)
    vDepth = remap(newPosition.z, -25.0, -8.0);

    vec4 modelPosition = modelMatrix * instanceMatrix * vec4(newPosition, 1.0);        
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;    

    vUv = uv;
    vTextureCoords = aTextureCoords;
}
`;

const fragmentShader = `
varying vec2 vUv;
varying float vVisibility;
varying float vDepth;
varying vec4 vTextureCoords;

uniform sampler2D uAtlas;
uniform sampler2D uBlurryAtlas;

void main()
{            
    // Map texture coordinate boundaries inside the canvas atlas
    float xStart = vTextureCoords.x;
    float xEnd = vTextureCoords.y;
    float yStart = vTextureCoords.z;
    float yEnd = vTextureCoords.w;

    vec2 atlasUV = vec2(
        mix(xStart, xEnd, vUv.x),
        mix(yStart, yEnd, 1.0 - vUv.y)
    );     

    vec4 sharpTexel = texture2D(uAtlas, atlasUV);
    vec4 blurryTexel = texture2D(uBlurryAtlas, atlasUV);

    // Dynamic depth of field mixing
    vec4 color = mix(blurryTexel, sharpTexel, vDepth);

    // Apply Z-fade visibility
    color.a *= vVisibility;

    // Alpha discarding to prevent Z-sorting issues
    if (color.a < 0.05) discard;

    gl_FragColor = color;
}
`;

const commentsData = [
  {
    post: "Looking for recommendations for a good workspace setup!",
    username: "troll_hunter_99",
    handle: "@trollhunter",
    platform: "Instagram",
    comment: "This post is absolute garbage. Go delete your account and stop scamming people!",
    label: "TOXIC",
    score: "98%",
    action: "Auto-Hidden",
    color: "#ef4444",
  },
  {
    post: "Double tap if you want to grow your business this year! 📈",
    username: "crypto_moon_bot",
    handle: "@moon_gains",
    platform: "Facebook",
    comment: "👉 WIN FREE BITCOIN NOW! 💸 $10,000 Giveaway link in my bio!!! Hurry, limited time only!",
    label: "SPAM",
    score: "96%",
    action: "Auto-Blocked",
    color: "#f59e0b",
  },
  {
    post: "Our team worked 6 months on this release. Hope you love it!",
    username: "angry_user_101",
    handle: "@angry_user",
    platform: "Instagram",
    comment: "I hate you and everyone who likes this product. You should rot in hell.",
    label: "HATE SPEECH",
    score: "99%",
    action: "Auto-Hidden",
    color: "#dc2626",
  },
  {
    post: "What are your top design tips for 2026?",
    username: "get_followers_fast",
    handle: "@boost_likes",
    platform: "Facebook",
    comment: "GET 10k FOLLOWERS FOR ONLY $5! Real accounts, instant delivery! Check bio link!",
    label: "SPAM",
    score: "94%",
    action: "Auto-Blocked",
    color: "#f59e0b",
  },
  {
    post: "Get 20% off all courses this weekend only! Use code FUSE20.",
    username: "fake_reviewer_xyz",
    handle: "@review_faker",
    platform: "Instagram",
    comment: "SCAM ALERT! This company steals credit cards! Do not buy anything from them!",
    label: "TOXIC",
    score: "92%",
    action: "Held for Review",
    color: "#ef4444",
  },
  {
    post: "Just uploaded a new coding tutorial on my channel!",
    username: "spammer_josh",
    handle: "@josh_spams",
    platform: "Instagram",
    comment: "Check out my page for makeup tips, beauty tutorials, and awesome lifestyle hacks! 💄✨",
    label: "PROMOTIONAL",
    score: "87%",
    action: "Held for Review",
    color: "#a855f7",
  },
  {
    post: "Throwback to our beach vacation last summer. Miss this place!",
    username: "troll_face_4",
    handle: "@troll_face",
    platform: "Facebook",
    comment: "You look so ugly and fat. Stop posting videos, you're embarrassing yourself.",
    label: "HARASSMENT",
    score: "95%",
    action: "Auto-Hidden",
    color: "#e11d48",
  },
  {
    post: "How do you stay motivated when working from home?",
    username: "quick_rich_schemer",
    handle: "@easy_money_club",
    platform: "Instagram",
    comment: "Make $500/day working from home! No experience needed. DM me for details!",
    label: "SPAM",
    score: "91%",
    action: "Auto-Blocked",
    color: "#f59e0b",
  },
  {
    post: "We just crossed 100k subscribers! Thank you all so much! 🎉",
    username: "toxic_hater",
    handle: "@hater_crew",
    platform: "Facebook",
    comment: "This is the dumbest video I've ever seen. You have zero talent, delete this trash.",
    label: "TOXIC",
    score: "93%",
    action: "Auto-Hidden",
    color: "#ef4444",
  },
  {
    post: "Starting my 30-day fitness challenge today. Wish me luck!",
    username: "adult_links_spam",
    handle: "@hot_pics_here",
    platform: "Instagram",
    comment: "Want to see my private webcam show for free? 🔞 Link in bio, only 18+!",
    label: "SPAM",
    score: "97%",
    action: "Auto-Blocked",
    color: "#f59e0b",
  },
];

// Helper to draw rounded rectangle paths on canvas
const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
};

// Helper to wrap text dynamically
const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + " ";
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
};

export default function CommentVisualiser() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // Set up Dimensions
    let rect = container.getBoundingClientRect();
    let width = rect.width || window.innerWidth;
    let height = rect.height || 600;

    let time = 0;
    const clock = new THREE.Clock();
    const dragSensitivity = 0.8;
    const dragDamping = 0.08;

    const drag = {
      xCurrent: 0,
      xTarget: 0,
      yCurrent: 0,
      yTarget: 0,
      isDown: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
    };

    const scrollY = {
      target: 0,
      current: 0,
    };

    // 1. Create Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 10;

    // 2. Set camera size calculation
    const getSizes = () => {
      let fov = camera.fov * (Math.PI / 180);
      let cameraHeight = camera.position.z * Math.tan(fov / 2) * 2;
      let cameraWidth = cameraHeight * camera.aspect;
      return { width: cameraWidth, height: cameraHeight };
    };

    let sizes = getSizes();
    let shaderParameters = {
      maxX: sizes.width * 2,
      maxY: sizes.height * 2,
    };

    // 3. Create Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

    // 4. Generate Texture Atlas Canvas
    const atlasCanvas = document.createElement("canvas");
    // Standard size per card: 512 x 320. 10 cards stacked vertically.
    atlasCanvas.width = 512;
    atlasCanvas.height = commentsData.length * 320;
    const ctx = atlasCanvas.getContext("2d");

    // Draw cards on atlas canvas
    const imageInfos = commentsData.map((comment, i) => {
      const cardW = 460;
      const cardH = 280;
      const cardX = 26;
      const cardY = i * 320 + 20;

      ctx.save();

      // Card Shadow (creates a beautiful floating 3D effect in light mode)
      ctx.shadowColor = "rgba(0, 0, 0, 0.06)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 6;

      // Card Background (metallic light/white glassmorphism)
      const grad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
      grad.addColorStop(1, "rgba(250, 250, 253, 0.99)");
      ctx.fillStyle = grad;

      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 18);
      ctx.fill();

      // Turn off shadow for rendering subsequent elements
      ctx.shadowColor = "transparent";

      // Border showing warning color
      ctx.strokeStyle = comment.color + "33";
      ctx.lineWidth = 2;
      ctx.stroke();

      // --- Post Context Header ---
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("ORIGINAL POST", cardX + 24, cardY + 22);

      ctx.fillStyle = "#374151";
      ctx.font = "italic 13px sans-serif";
      wrapText(ctx, `"${comment.post}"`, cardX + 24, cardY + 36, cardW - 48, 18);

      // Separator Line
      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX + 24, cardY + 80);
      ctx.lineTo(cardX + cardW - 24, cardY + 80);
      ctx.stroke();

      // --- Commenter Info ---
      // Avatar
      const avatarX = cardX + 42;
      const avatarY = cardY + 112;
      const avatarRadius = 18;
      const avatarGrad = ctx.createLinearGradient(avatarX - 18, avatarY - 18, avatarX + 18, avatarY + 18);
      avatarGrad.addColorStop(0, comment.color);
      avatarGrad.addColorStop(1, "#f3f4f6");
      ctx.fillStyle = avatarGrad;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.fill();

      // Avatar Text
      ctx.fillStyle = "#111827";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(comment.username[0].toUpperCase(), avatarX, avatarY);

      // Username
      ctx.fillStyle = "#111827";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(comment.username, cardX + 70, cardY + 104);

      // Handle
      ctx.fillStyle = "#6b7280";
      ctx.font = "11px sans-serif";
      ctx.fillText(comment.handle, cardX + 70, cardY + 120);

      // Platform Badge
      const platformX = cardX + cardW - 100;
      const platformY = cardY + 98;
      const isIG = comment.platform === "Instagram";
      ctx.fillStyle = isIG ? "rgba(225, 48, 108, 0.08)" : "rgba(24, 119, 242, 0.08)";
      ctx.strokeStyle = isIG ? "rgba(225, 48, 108, 0.3)" : "rgba(24, 119, 242, 0.3)";
      ctx.beginPath();
      drawRoundedRect(ctx, platformX, platformY, 80, 22, 11);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isIG ? "#e1306c" : "#1877f2";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(comment.platform, platformX + 40, platformY + 11);

      // Comment Text
      ctx.fillStyle = "#1f2937";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      wrapText(ctx, comment.comment, cardX + 24, cardY + 148, cardW - 48, 20);

      // Bottom Severity Meter Badge
      const pillX = cardX + 24;
      const pillY = cardY + cardH - 38;
      ctx.fillStyle = comment.color + "15";
      ctx.strokeStyle = comment.color + "55";
      ctx.beginPath();
      drawRoundedRect(ctx, pillX, pillY, 155, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = comment.color;
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚠ " + comment.label + " " + comment.score, pillX + 77.5, pillY + 12);

      // Bottom Action Badge
      const actX = cardX + cardW - 154;
      const actY = cardY + cardH - 38;
      ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.beginPath();
      drawRoundedRect(ctx, actX, actY, 130, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#4b5563";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(comment.action, actX + 65, actY + 12);

      ctx.restore();

      // Calculate UV bounds
      return {
        uvs: {
          xStart: 0,
          xEnd: 1,
          yStart: 1 - (i * 320) / (commentsData.length * 320),
          yEnd: 1 - ((i + 1) * 320) / (commentsData.length * 320),
        },
      };
    });

    // Create sharp atlas texture
    const atlasTexture = new THREE.Texture(atlasCanvas);
    atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
    atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
    atlasTexture.minFilter = THREE.LinearFilter;
    atlasTexture.magFilter = THREE.LinearFilter;
    atlasTexture.needsUpdate = true;

    // Create blurred atlas texture (for depth-of-field blur)
    const blurryCanvas = document.createElement("canvas");
    blurryCanvas.width = atlasCanvas.width;
    blurryCanvas.height = atlasCanvas.height;
    const blurryCtx = blurryCanvas.getContext("2d");
    if (blurryCtx) {
      blurryCtx.filter = "blur(12px)";
      blurryCtx.drawImage(atlasCanvas, 0, 0);
    }
    const blurryAtlasTexture = new THREE.Texture(blurryCanvas);
    blurryAtlasTexture.wrapS = THREE.ClampToEdgeWrapping;
    blurryAtlasTexture.wrapT = THREE.ClampToEdgeWrapping;
    blurryAtlasTexture.minFilter = THREE.LinearFilter;
    blurryAtlasTexture.magFilter = THREE.LinearFilter;
    blurryAtlasTexture.needsUpdate = true;

    // 5. Instanced Mesh
    // Comment Card aspect ratio: 460 / 280 = 1.64
    const geometry = new THREE.PlaneGeometry(1.64, 1.0, 1, 1);
    
    // SCALE UP: Increased card size from 2.2 to 3.4
    geometry.scale(3.4, 3.4, 3.4);

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMaxXdisplacement: {
          value: new THREE.Vector2(shaderParameters.maxX, shaderParameters.maxY),
        },
        uAtlas: { value: atlasTexture },
        uBlurryAtlas: { value: blurryAtlasTexture },
        uScrollY: { value: 0 },
        uDrag: { value: new THREE.Vector2(0, 0) },
      },
    });

    // Lower instance count to prevent massive overlaps now that cards are bigger
    const meshCount = 110;
    const instancedMesh = new THREE.InstancedMesh(geometry, shaderMaterial, meshCount);
    scene.add(instancedMesh);

    // Initial position, speed, and texture coordinates matrices
    const initialPosition = new Float32Array(meshCount * 3);
    const meshSpeed = new Float32Array(meshCount);
    const aTextureCoords = new Float32Array(meshCount * 4);

    for (let i = 0; i < meshCount; i++) {
      // Position spread
      initialPosition[i * 3 + 0] = (Math.random() - 0.5) * shaderParameters.maxX * 2;
      initialPosition[i * 3 + 1] = (Math.random() - 0.5) * shaderParameters.maxY * 2;
      initialPosition[i * 3 + 2] = Math.random() * (7 - -30) - 30; // Z depth from -30 to +7

      // Floating speed multiplier
      meshSpeed[i] = Math.random() * 0.4 + 0.3;

      // Select comment index mapping
      const imageIndex = i % imageInfos.length;
      aTextureCoords[i * 4 + 0] = imageInfos[imageIndex].uvs.xStart;
      aTextureCoords[i * 4 + 1] = imageInfos[imageIndex].uvs.xEnd;
      aTextureCoords[i * 4 + 2] = imageInfos[imageIndex].uvs.yStart;
      aTextureCoords[i * 4 + 3] = imageInfos[imageIndex].uvs.yEnd;
    }

    geometry.setAttribute("aInitialPosition", new THREE.InstancedBufferAttribute(initialPosition, 3));
    geometry.setAttribute("aMeshSpeed", new THREE.InstancedBufferAttribute(meshSpeed, 1));
    geometry.setAttribute("aTextureCoords", new THREE.InstancedBufferAttribute(aTextureCoords, 4));

    // 6. Interaction Event Listeners
    const onPointerDown = (e) => {
      drag.isDown = true;
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e) => {
      if (!drag.isDown) return;
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;

      const worldPerPixelX = (sizes.width / width) * dragSensitivity;
      const worldPerPixelY = (sizes.height / height) * dragSensitivity;

      drag.xTarget += -dx * worldPerPixelX;
      drag.yTarget += dy * worldPerPixelY;
    };

    const onPointerUp = (e) => {
      drag.isDown = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    };

    const onWheelGlobal = (e) => {
      const norm = normalizeWheel(e);
      let dy = (norm.pixelY * sizes.height) / window.innerHeight;
      scrollY.target += dy;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("wheel", onWheelGlobal, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      let newRect = container.getBoundingClientRect();
      width = newRect.width || window.innerWidth;
      height = newRect.height || 600;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      sizes = getSizes();
      shaderParameters.maxX = sizes.width * 2;
      shaderParameters.maxY = sizes.height * 2;

      shaderMaterial.uniforms.uMaxXdisplacement.value.set(shaderParameters.maxX, shaderParameters.maxY);

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    };

    window.addEventListener("resize", handleResize);

    // 7. Render Loop
    let animationFrameId;
    const render = () => {
      const now = clock.getElapsedTime();
      const delta = now - time;
      time = now;

      const normalizedDelta = delta / (1 / 60);

      shaderMaterial.uniforms.uTime.value += normalizedDelta * 0.008;

      // Smooth drag easing
      drag.xCurrent += (drag.xTarget - drag.xCurrent) * dragDamping;
      drag.yCurrent += (drag.yTarget - drag.yCurrent) * dragDamping;
      shaderMaterial.uniforms.uDrag.value.set(drag.xCurrent, drag.yCurrent);

      // Smooth scroll easing
      scrollY.current += (scrollY.target - scrollY.current) * 0.1;
      shaderMaterial.uniforms.uScrollY.value = scrollY.current;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // 8. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("wheel", onWheelGlobal);

      // Dispose resources
      geometry.dispose();
      shaderMaterial.dispose();
      atlasTexture.dispose();
      blurryAtlasTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    // bg-slate-50 makes the background white/very light grey
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-50 select-none">
      <canvas ref={canvasRef} className="block w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
