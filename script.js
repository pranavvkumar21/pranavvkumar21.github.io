/* ══════════════════════════════════════════════════
   PRANAV KUMAR — ROBOTICS PORTFOLIO
   script.js v2 — Three.js + Anime.js + Magic UI
══════════════════════════════════════════════════ */
'use strict';

/* ────────────────────────────────────────
   THEME MANAGER (light / dark)
──────────────────────────────────────── */
const ThemeManager = (() => {
    const root = document.documentElement;
    const btn  = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    let dark = localStorage.getItem('theme') !== 'light';

    const apply = () => {
        root.setAttribute('data-theme', dark ? 'dark' : 'light');
        if (icon) { icon.className = dark ? 'fas fa-moon' : 'fas fa-sun'; }
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        // Notify Three.js of theme change
        document.dispatchEvent(new CustomEvent('themechange', { detail: { dark } }));
    };

    const toggle = () => { dark = !dark; apply(); };
    const init   = () => { apply(); btn?.addEventListener('click', toggle); };
    return { init, isDark: () => dark };
})();

/* ────────────────────────────────────────
   LOADER
──────────────────────────────────────── */
const Loader = (() => {
    const el   = document.getElementById('loader');
    const bar  = document.getElementById('lbar');
    const txt  = document.getElementById('ltxt');
    const msgs = ['BOOTING SYSTEMS_','LOADING MODULES_','CALIBRATING_','READY_'];
    let p = 0;

    const tick = () => {
        p += Math.random() * 22 + 6;
        if (p > 100) p = 100;
        bar.style.width = p + '%';
        txt.textContent = msgs[Math.min(Math.floor(p / 34), msgs.length - 1)];
        if (p < 100) setTimeout(tick, 60 + Math.random() * 70);
        else setTimeout(() => { el.classList.add('out'); }, 420);
    };

    const start = () => setTimeout(tick, 180);
    return { start };
})();

/* ────────────────────────────────────────
   THREE.JS — ROBOT HERO SCENE (GLTFLoader)
   ─────────────────────────────────────────
   PUT YOUR ASSET AT:  assets/robot.glb
   Free assets: sketchfab.com | quaternius.com
   Formats supported: .glb / .gltf
──────────────────────────────────────── */
const RobotScene = (() => {
    let renderer, scene, camera, robotMesh, mixer, gridHelper, frameId, clock;
    const canvas = document.getElementById('heroCanvas');
    const ASSET  = 'assets/robot.glb'; // ← set this to your file path

    if (!canvas || typeof THREE === 'undefined') return { init: () => {} };

    const DARK_BG  = 0x070c14;
    const LIGHT_BG = 0xdde4f0;
    const ACCENT   = 0x38bdf8;
    let isDark = ThemeManager.isDark();

    // Floating circuit nodes (always shown regardless of asset)
    const buildNodes = () => {
        const pts = new THREE.Group();
        for (let i = 0; i < 22; i++) {
            const geo = Math.random() > .5
                ? new THREE.OctahedronGeometry(Math.random() * .045 + .02, 0)
                : new THREE.BoxGeometry(.04, .04, .04);
            const mat = new THREE.MeshStandardMaterial({
                color: ACCENT, emissive: ACCENT, emissiveIntensity: .5,
                roughness: .2, metalness: .8,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                (Math.random() - .5) * 5,
                (Math.random() - .5) * 4,
                (Math.random() - .5) * 2 - 1
            );
            mesh.userData.phase = Math.random() * Math.PI * 2;
            mesh.userData.speed = .4 + Math.random() * .6;
            pts.add(mesh);
        }
        return pts;
    };

    const buildLines = (nodes) => {
        const group = new THREE.Group();
        const ch = nodes.children;
        for (let i = 0; i < ch.length; i++) {
            if (Math.random() > .45) continue;
            const j = Math.floor(Math.random() * ch.length);
            if (i === j) continue;
            const pts = [ch[i].position.clone(), ch[j].position.clone()];
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({ color: ACCENT, opacity: .12, transparent: true });
            group.add(new THREE.Line(geo, mat));
        }
        return group;
    };

    const setupLights = () => {
        scene.children.filter(c => c.isLight).forEach(l => scene.remove(l));
        scene.add(new THREE.AmbientLight(0xffffff, isDark ? .35 : .8));
        const dir = new THREE.DirectionalLight(0xffffff, isDark ? 1.4 : 2.0);
        dir.position.set(4, 8, 4);
        dir.castShadow = true;
        dir.shadow.mapSize.set(1024, 1024);
        scene.add(dir);
        const rim = new THREE.PointLight(ACCENT, isDark ? 2.8 : 1.4, 14);
        rim.position.set(-3, 3, 2);
        scene.add(rim);
        const fill = new THREE.PointLight(0x6ee7b7, isDark ? 1.1 : .6, 10);
        fill.position.set(3, -1, 3);
        scene.add(fill);
        if (!isDark) {
            scene.add(Object.assign(new THREE.DirectionalLight(0xfff0d0, .9), { position: new THREE.Vector3(-3, 6, -2) }));
        }
    };

    const init = () => {
        clock = new THREE.Clock();

        // Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(isDark ? DARK_BG : LIGHT_BG, .055);

        // Camera
        camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, .1, 100);
        camera.position.set(0, 1.5, 8.0);
        camera.lookAt(0, 1, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setClearColor(isDark ? DARK_BG : LIGHT_BG, 1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = isDark ? 1.1 : 1.4;

        setupLights();

        // Grid floor
        gridHelper = new THREE.GridHelper(14, 24,
            isDark ? 0x0e2233 : 0xd0dce8,
            isDark ? 0x0a1a28 : 0xdde8f0);
        gridHelper.position.y = -1.5;
        scene.add(gridHelper);

        // Ambient nodes + lines
        const nodes = buildNodes();
        scene.add(nodes);
        scene.add(buildLines(nodes));

        // ── LOAD GLB ASSET ────────────────────────────────
        // Requires GLTFLoader — loaded via CDN in index.html
        if (typeof THREE.GLTFLoader !== 'undefined') {
            const loader = new THREE.GLTFLoader();
            loader.load(
                ASSET,
                (gltf) => {
                    robotMesh = gltf.scene;

                    // Auto-scale: fit model into a ~3-unit bounding box
                    const box    = new THREE.Box3().setFromObject(robotMesh);
                    const size   = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale  = 3.0 / maxDim;
                    robotMesh.scale.setScalar(scale);

                    // Centre the model at origin then lift to grid
                    const center = box.getCenter(new THREE.Vector3());
                    robotMesh.position.set(
                        -center.x * scale,
                        -box.min.y * scale - 1.5,
                        -center.z * scale + 0.2
                    );

                    // Enable shadows on every mesh
                    robotMesh.traverse(child => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    scene.add(robotMesh);

                    // Wire up animations if the asset has any
                    if (gltf.animations && gltf.animations.length > 0) {
                        mixer = new THREE.AnimationMixer(robotMesh);
                        gltf.animations.forEach(clip => {
                            mixer.clipAction(clip).play();
                        });
                    }
                },
                // Progress callback
                (xhr) => {
                    if (xhr.lengthComputable) {
                        const pct = Math.round(xhr.loaded / xhr.total * 100);
                        console.log(`[RobotScene] Loading: ${pct}%`);
                    }
                },
                // Error callback — logs clearly so you know what went wrong
                (err) => {
                    console.warn('[RobotScene] Could not load asset at:', ASSET);
                    console.warn('[RobotScene] Error:', err);
                    console.info('[RobotScene] Place your .glb file at', ASSET, '— nodes will animate in the meantime.');
                }
            );
        } else {
            console.warn('[RobotScene] THREE.GLTFLoader not found. Add the CDN script to index.html.');
        }
        // ─────────────────────────────────────────────────

        // Theme change
        document.addEventListener('themechange', (e) => {
            isDark = e.detail.dark;
            renderer.setClearColor(isDark ? DARK_BG : LIGHT_BG, 1);
            renderer.toneMappingExposure = isDark ? 1.1 : 1.4;
            scene.fog.color.set(isDark ? DARK_BG : LIGHT_BG);
            if (gridHelper) {
                gridHelper.material[0].color.set(isDark ? 0x0e2233 : 0xd0dce8);
                gridHelper.material[1].color.set(isDark ? 0x0a1a28 : 0xdde8f0);
            }
            setupLights();
        });

        // Mouse parallax
        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', e => {
            mouseX = (e.clientX / window.innerWidth - .5) * 2;
            mouseY = (e.clientY / window.innerHeight - .5) * 2;
        }, { passive: true });

        // Resize
        window.addEventListener('resize', () => {
            const w = canvas.clientWidth, h = canvas.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }, { passive: true });

        // Render loop
        let t = 0;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            t += .008;

            // Advance GLTF animations
            if (mixer) mixer.update(delta);

            // Gentle robot rotation (works even before asset loads)
            if (robotMesh) {
                robotMesh.rotation.y = Math.sin(t * .3) * .5 + mouseX * .3;
                robotMesh.rotation.x = mouseY * .06;
            }

            // Float circuit nodes
            nodes.children.forEach(n => {
                n.position.y += Math.sin(t * n.userData.speed + n.userData.phase) * .002;
                n.rotation.x += .008;
                n.rotation.z += .005;
            });

            // Camera drift
            camera.position.x += (mouseX * .55 - camera.position.x) * .03;
            camera.position.y += (1.5 + mouseY * .25 - camera.position.y) * .03;
            camera.lookAt(0, 1, 0);

            renderer.render(scene, camera);
        };
        animate();

        // Pause when hero off-screen
        const heroEl = document.getElementById('home');
        new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                if (!frameId) animate();
            } else {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
        }).observe(heroEl);
    };

    return { init };
})();

/* ────────────────────────────────────────
   CURSOR
──────────────────────────────────────── */
const Cursor = (() => {
    const cur  = document.getElementById('cursor');
    const dot  = cur?.querySelector('.c-dot');
    const ring = cur?.querySelector('.c-ring');
    if (!cur || window.innerWidth < 768) return { init: () => {} };

    let rx = 0, ry = 0, tx = 0, ty = 0;
    const lerp = (a, b, n) => a + (b - a) * n;

    const tick = () => {
        rx = lerp(rx, tx, .13);
        ry = lerp(ry, ty, .13);
        ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
        requestAnimationFrame(tick);
    };

    const init = () => {
        document.addEventListener('mousemove', e => {
            tx = e.clientX; ty = e.clientY;
            dot.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
        }, { passive: true });
        document.querySelectorAll('a,button,.project-card,.magnetic,input,textarea').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
        });
        tick();
    };
    return { init };
})();

/* ────────────────────────────────────────
   SCROLL PROGRESS
──────────────────────────────────────── */
const ScrollProgress = (() => {
    const bar = document.getElementById('scroll-bar');
    const update = () => {
        const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
        bar.style.width = pct + '%';
    };
    return { init: () => window.addEventListener('scroll', update, { passive: true }) };
})();

/* ────────────────────────────────────────
   NAV
──────────────────────────────────────── */
const Nav = (() => {
    const nav  = document.getElementById('nav');
    const hbg  = document.getElementById('hamburger');
    const lnks = document.getElementById('navLinks');

    const init = () => {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('stuck', window.scrollY > 20);
        }, { passive: true });

        hbg?.addEventListener('click', () => {
            const open = hbg.classList.toggle('open');
            lnks.classList.toggle('open', open);
        });

        lnks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            hbg.classList.remove('open');
            lnks.classList.remove('open');
        }));

        // Active section via IntersectionObserver
        const sections = document.querySelectorAll('section[id]');
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                const a = document.querySelector(`.nav-link[data-s="${e.target.id}"]`);
                if (a) a.classList.add('active');
            });
        }, { threshold: .35 });
        sections.forEach(s => io.observe(s));
    };
    return { init };
})();

/* ────────────────────────────────────────
   TYPED ROLE
──────────────────────────────────────── */
const TypedRole = (() => {
    const el    = document.getElementById('typedRole');
    const roles = ['Robotics Engineer','AI Developer','ROS2 Specialist','Bio-Inspired Systems','Legged Locomotion'];
    let ri = 0, ci = 0, del = false;

    const tick = () => {
        const r = roles[ri];
        if (!del) {
            el.textContent = r.slice(0, ++ci);
            if (ci === r.length) { del = true; setTimeout(tick, 2000); return; }
        } else {
            el.textContent = r.slice(0, --ci);
            if (ci === 0) { del = false; ri = (ri + 1) % roles.length; }
        }
        setTimeout(tick, del ? 32 : 64);
    };
    return { init: () => { if (el) setTimeout(tick, 2200); } };
})();

/* ────────────────────────────────────────
   SCROLL ANIMATIONS (Anime.js AOS)
──────────────────────────────────────── */
const AOS = (() => {
    const done = new Set();

    const run = (el) => {
        if (done.has(el)) return;
        done.add(el);
        const type  = el.dataset.aos || 'fade-up';
        const delay = parseInt(el.dataset.aosD || el.dataset.delay || 0);

        if (typeof anime === 'undefined') {
            el.style.transition = 'opacity .7s ease, transform .7s ease';
            el.style.transitionDelay = delay + 'ms';
            el.style.opacity = 1;
            el.style.transform = 'none';
            return;
        }

        const base = { targets: el, duration: 750, delay, easing: 'cubicBezier(.16,1,.3,1)', opacity: [0, 1] };
        if (type === 'fade-up')    Object.assign(base, { translateY: [36, 0] });
        if (type === 'fade-left')  Object.assign(base, { translateX: [44, 0] });
        if (type === 'fade-right') Object.assign(base, { translateX: [-44, 0] });

        anime(base);
    };

    const init = () => {
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) run(e.target); });
        }, { threshold: .08, rootMargin: '0px 0px -36px 0px' });

        document.querySelectorAll('[data-aos]').forEach(el => {
            el.style.opacity = 0;
            io.observe(el);
        });
    };
    return { init };
})();

/* ────────────────────────────────────────
   COUNTER ANIMATION
──────────────────────────────────────── */
const Counters = (() => {
    const init = () => {
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const el = e.target;
                const target = parseInt(el.dataset.count);
                io.unobserve(el);
                if (typeof anime !== 'undefined') {
                    const obj = { v: 0 };
                    anime({ targets: obj, v: target, duration: 1600, delay: 600, easing: 'easeOutExpo',
                        update: () => { el.textContent = Math.round(obj.v); } });
                } else {
                    let v = 0; const step = target / 40;
                    const t = setInterval(() => {
                        v += step; el.textContent = Math.min(Math.round(v), target);
                        if (v >= target) clearInterval(t);
                    }, 40);
                }
            });
        }, { threshold: .5 });
        document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
    };
    return { init };
})();

/* ────────────────────────────────────────
   MAGNETIC EFFECT
──────────────────────────────────────── */
const Magnetic = (() => {
    const init = () => {
        if (window.innerWidth < 768) return;
        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                const dx = (e.clientX - r.left - r.width / 2) * .22;
                const dy = (e.clientY - r.top - r.height / 2) * .22;
                el.style.transform = `translate(${dx}px,${dy}px)`;
            });
            el.addEventListener('mouseleave', () => el.style.transform = '');
        });
    };
    return { init };
})();

/* ────────────────────────────────────────
   HERO ENTRANCE
──────────────────────────────────────── */
const HeroEntrance = (() => {
    const init = () => {
        if (typeof anime === 'undefined') return;
        anime.timeline({ easing: 'cubicBezier(.16,1,.3,1)' })
            .add({ targets: '.magic-badge',  opacity: [0,1], translateY: [16,0], duration: 550 })
            .add({ targets: '.hero-h1',      opacity: [0,1], translateY: [28,0], duration: 700 }, '-=300')
            .add({ targets: '.hero-desc',    opacity: [0,1], translateY: [20,0], duration: 550 }, '-=400')
            .add({ targets: '.hero-cta',     opacity: [0,1], translateY: [20,0], duration: 500 }, '-=350')
            .add({ targets: '.hero-stats',   opacity: [0,1], translateY: [18,0], duration: 500 }, '-=300')
            .add({ targets: '.hero-right',   opacity: [0,1], translateX: [40,0], duration: 700 }, '-=700');
    };
    return { init };
})();

/* ────────────────────────────────────────
   PROJECTS
──────────────────────────────────────── */
const Projects = (() => {
    const container = document.getElementById('projects-container');
    const modal     = document.getElementById('projectModal');

    const openModal = (p) => {
        document.getElementById('modalTitle').textContent = p.name;
        document.getElementById('modalDescription').textContent = p.fullDescription || p.description || '';
        const img = document.getElementById('modalImage');
        img.src = p.image || 'assets/cover.jpg';
        img.alt = p.name;
        document.getElementById('modalTags').innerHTML = (p.tags||[]).map(t=>`<span class="mtag">${t}</span>`).join('');
        document.getElementById('modalLinks').innerHTML = p.url?.trim()
            ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fab fa-github"></i> View on GitHub</a>`
            : `<span class="project-link unavailable">Code not publicly available</span>`;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    };

    const render = (repos) => {
        container.className = 'proj-showcase-wrap';
        container.innerHTML = `
            <div class="proj-track" id="projTrack"></div>
            <div class="proj-nav">
                <button class="proj-arrow" id="projPrev" aria-label="Previous"><i class="fas fa-arrow-left"></i></button>
                <div class="proj-dots" id="projDots"></div>
                <button class="proj-arrow" id="projNext" aria-label="Next"><i class="fas fa-arrow-right"></i></button>
            </div>`;

        const track = document.getElementById('projTrack');
        const dots  = document.getElementById('projDots');

        repos.forEach((r, idx) => {
            const isVideo   = /\.(mp4|webm)$/i.test(r.image || '');
            const hasImage  = !!(r.image && r.image.trim());
            let mediaEl;

            if (!hasImage) {
                // Animated canvas placeholder — built below after card is inserted
                mediaEl = `<canvas class="proj-placeholder" aria-label="${r.name} placeholder"></canvas>`;
            } else if (isVideo) {
                mediaEl = `<video class="proj-thumb" src="${r.image}" muted loop playsinline preload="none"></video>`;
            } else {
                mediaEl = `<img class="proj-thumb" src="${r.image}" alt="${r.name}" loading="lazy" decoding="async">`;
            }

            const card = document.createElement('div');
            card.className = 'proj-slide';
            card.innerHTML = `
                <div class="proj-media">
                    ${mediaEl}
                    <div class="proj-media-overlay"></div>
                    <span class="proj-index mono">0${idx + 1}</span>
                </div>
                <div class="proj-info">
                    <h3 class="proj-name">${r.name}</h3>
                    <p class="proj-desc">${r.description || ''}</p>
                    <div class="proj-cta">
                        ${r.url?.trim()
                            ? `<a href="${r.url}" target="_blank" rel="noopener noreferrer" class="project-link" onclick="event.stopPropagation()"><i class="fab fa-github"></i> Code</a>`
                            : `<span class="project-link unavailable"><i class="fas fa-lock"></i> Private</span>`}
                        <button class="project-link proj-detail-btn"><i class="fas fa-expand-alt"></i> Details</button>
                    </div>
                </div>`;

            if (isVideo) {
                const vid = card.querySelector('video');
                card.addEventListener('mouseenter', () => vid.play());
                card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
            }

            if (!hasImage) {
                const cv = card.querySelector('.proj-placeholder');
                if (cv) _animatePlaceholder(cv, r.name);
            }

            card.querySelector('.proj-detail-btn')?.addEventListener('click', e => { e.stopPropagation(); openModal(r); });
            card.addEventListener('click', () => openModal(r));
            track.appendChild(card);

            const dot = document.createElement('button');
            dot.className = 'proj-dot';
            dot.setAttribute('aria-label', `Project ${idx + 1}`);
            dots.appendChild(dot);
        });

        const allCards = Array.from(track.querySelectorAll('.proj-slide'));
        const allDots  = Array.from(dots.querySelectorAll('.proj-dot'));

        const snapTo = (idx) => {
            const c = allCards[idx];
            if (c) track.scrollTo({ left: c.offsetLeft, behavior: 'smooth' });
        };

        const updateDots = () => {
            const tr = track.getBoundingClientRect();
            allCards.forEach((c, i) => {
                const cr = c.getBoundingClientRect();
                allDots[i]?.classList.toggle('active', cr.left >= tr.left - 10 && cr.left < tr.right - 80);
            });
        };

        allDots.forEach((d, i) => d.addEventListener('click', () => snapTo(i)));
        track.addEventListener('scroll', updateDots, { passive: true });
        document.getElementById('projPrev')?.addEventListener('click', () => track.scrollBy({ left: -370, behavior: 'smooth' }));
        document.getElementById('projNext')?.addEventListener('click', () => track.scrollBy({ left:  370, behavior: 'smooth' }));

        const io = new IntersectionObserver(entries => {
            if (!entries[0].isIntersecting) return;
            if (typeof anime !== 'undefined') {
                anime({ targets: '.proj-slide', opacity: [0, 1], translateX: [40, 0],
                    delay: anime.stagger(80, { start: 100 }), duration: 700, easing: 'cubicBezier(.16,1,.3,1)' });
            } else {
                allCards.forEach((c, i) => setTimeout(() => {
                    c.style.transition = 'opacity .6s,transform .6s';
                    c.style.opacity = 1; c.style.transform = 'none';
                }, i * 80));
            }
            updateDots();
            io.disconnect();
        }, { threshold: 0.05 });
        io.observe(track);
    };

    // ── Animated canvas placeholder ────────────────────────────────────────
    const _animatePlaceholder = (cv, name) => {
        const W = cv.offsetWidth  || 340;
        const H = cv.offsetHeight || 210;
        cv.width  = W;
        cv.height = H;
        const ctx = cv.getContext('2d');

        // Project initials (up to 2 words)
        const initials = name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

        const count = 28;
        const pts = Array.from({ length: count }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - .5) * .38, vy: (Math.random() - .5) * .38,
            r: Math.random() * 2.2 + 1, phase: Math.random() * Math.PI * 2
        }));

        // Read theme each frame so toggling updates live
        const sky  = () => document.documentElement.getAttribute('data-theme') === 'light'
            ? 'rgba(3,105,161,' : 'rgba(56,189,248,';
        const bg   = () => document.documentElement.getAttribute('data-theme') === 'light'
            ? '#d0d8ec' : '#070c14';

        let t = 0, raf = null;

        const draw = () => {
            t += .014;
            ctx.fillStyle = bg();
            ctx.fillRect(0, 0, W, H);

            // Subtle grid
            ctx.strokeStyle = sky() + '.05)';
            ctx.lineWidth = .5;
            const gs = 32;
            ctx.beginPath();
            for (let x = 0; x <= W; x += gs) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
            for (let y = 0; y <= H; y += gs) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
            ctx.stroke();

            // Move + wrap particles
            for (const p of pts) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;
            }

            // Connecting lines
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 90) {
                        ctx.beginPath();
                        ctx.strokeStyle = sky() + (1 - d / 90) * .26 + ')';
                        ctx.lineWidth = .8;
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Particle dots
            for (const p of pts) {
                const pulse = .55 + .45 * Math.sin(t * 1.6 + p.phase);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
                ctx.fillStyle = sky() + (.4 + .3 * pulse) + ')';
                ctx.fill();
            }

            // Central radial glow
            const cx = W / 2, cy = H / 2;
            const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, 68);
            gl.addColorStop(0, sky() + '.12)');
            gl.addColorStop(1, sky() + '0)');
            ctx.fillStyle = gl;
            ctx.fillRect(cx - 68, cy - 68, 136, 136);

            // Spinning hex ring
            const hr = 32, hs = t * .4;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(hs);
            ctx.beginPath();
            for (let k = 0; k < 6; k++) {
                const a = (Math.PI / 3) * k;
                k === 0 ? ctx.moveTo(Math.cos(a) * hr, Math.sin(a) * hr)
                        : ctx.lineTo(Math.cos(a) * hr, Math.sin(a) * hr);
            }
            ctx.closePath();
            ctx.strokeStyle = sky() + '.5)';
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();

            // Initials
            ctx.save();
            ctx.font = 'bold 15px "JetBrains Mono", monospace';
            ctx.fillStyle  = sky() + '1)';
            ctx.textAlign  = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = sky() + '.8)';
            ctx.shadowBlur  = 10;
            ctx.fillText(initials, cx, cy);
            ctx.restore();

            // Corner accents (mint)
            const ca = 14;
            ctx.strokeStyle = 'rgba(110,231,183,.5)';
            ctx.lineWidth   = 1.4;
            [[0,0,1,0,1],[W,0,-1,0,1],[0,H,1,0,-1],[W,H,-1,0,-1]].forEach(([ox,oy,hd,,vd]) => {
                ctx.beginPath();
                ctx.moveTo(ox + hd * ca, oy); ctx.lineTo(ox, oy); ctx.lineTo(ox, oy + vd * ca);
                ctx.stroke();
            });

            raf = requestAnimationFrame(draw);
        };

        // Pause off-screen
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { if (!raf) draw(); }
            else { cancelAnimationFrame(raf); raf = null; }
        });
        obs.observe(cv);
        draw();
    };
    // ──────────────────────────────────────────────────────────────────────

    const load = async () => {
        try {
            const res = await fetch('projects.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            render(await res.json());
        } catch (e) {
            container.innerHTML = `<p class="ld-state mono">Error loading projects: ${e.message}</p>`;
        }
    };

    const init = () => {
        load();
        modal?.querySelector('.modal-x')?.addEventListener('click', closeModal);
        modal?.querySelector('.modal-bg')?.addEventListener('click', closeModal);
        document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });
    };
    return { init };
})();

/* ────────────────────────────────────────
   PUBLICATIONS
──────────────────────────────────────── */
const Publications = (() => {
    const init = async () => {
        const list = document.getElementById('pubList');
        if (!list) return;
        try {
            const res = await fetch('publications.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            list.innerHTML = data.publications.map(p =>
                `<li><a href="${p.url}" target="_blank" rel="noopener noreferrer">${p.title}</a></li>`
            ).join('');

            const io = new IntersectionObserver(entries => {
                if (!entries[0].isIntersecting) return;
                if (typeof anime !== 'undefined')
                    anime({ targets: '#pubList li', opacity: [0,1], translateX: [-16,0],
                        delay: anime.stagger(90, { start: 80 }), duration: 550, easing: 'cubicBezier(.16,1,.3,1)' });
                io.disconnect();
            }, { threshold: .1 });
            io.observe(list);
        } catch {
            list.innerHTML = '<li class="ld-state mono">Error loading publications.</li>';
        }
    };
    return { init };
})();

/* ────────────────────────────────────────
   GITHUB STATS
──────────────────────────────────────── */
const GitHubStats = (() => {
    const load = async () => {
        const container = document.getElementById('githubStats');
        if (!container) return;
        try {
            const [uRes, rRes] = await Promise.all([
                fetch('https://api.github.com/users/pranavvkumar21'),
                fetch('https://api.github.com/users/pranavvkumar21/repos?per_page=100'),
            ]);
            if (!uRes.ok) throw new Error('API error');
            const user  = await uRes.json();
            const repos = await rRes.json();
            const repoList = Array.isArray(repos) ? repos : [];
            const stars = repoList.reduce((a,r) => a + (r.stargazers_count || 0), 0);
            const forks = repoList.reduce((a,r) => a + (r.forks_count || 0), 0);

            const items = [
                { icon:'📚', val: user.public_repos,  label: 'Repositories' },
                { icon:'⭐', val: stars,               label: 'Total Stars' },
                { icon:'🍴', val: forks,               label: 'Total Forks' },
                { icon:'👥', val: user.followers,      label: 'Followers' },
                { icon:'🔗', val: user.following,      label: 'Following' },
                { icon:'📅', val: new Date(user.created_at).getFullYear(), label: 'Member Since' },
            ];

            container.innerHTML = items.map(i => `
                <div class="gh-stat-card">
                    <div class="gh-icon">${i.icon}</div>
                    <div><h3 class="mono">${i.val}</h3><p>${i.label}</p></div>
                </div>`).join('');

            if (typeof anime !== 'undefined') {
                anime({ targets: '.gh-stat-card', opacity: [0,1], translateY: [18,0],
                    delay: anime.stagger(70, { start: 80 }), duration: 600, easing: 'cubicBezier(.16,1,.3,1)' });
            } else {
                document.querySelectorAll('.gh-stat-card').forEach((el, i) => {
                    el.style.animationDelay = (80 + i * 70) + 'ms';
                    el.classList.add('reveal');
                });
            }

            // Language breakdown from repos
            const langs = {};
            repoList.forEach(r => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
            const langTotal = Object.values(langs).reduce((a, b) => a + b, 0);
            const sorted = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 8);
            const LANG_COLORS = {
                Python:'#3572A5','C++':'#f34b7d',JavaScript:'#f1e05a',
                TypeScript:'#3178c6',C:'#555555',Shell:'#89e051',
                CMake:'#DA3434',MATLAB:'#e16737',Jupyter:'#DA5B0B',
                HTML:'#e34c26',CSS:'#563d7c',Rust:'#dea584',Go:'#00ADD8'
            };
            const langsEl = document.getElementById('ghLangs');
            if (langsEl && langTotal > 0) {
                langsEl.innerHTML =
                    '<div class="gh-lang-title mono">Top Languages</div>' +
                    '<div class="gh-lang-bar">' +
                    sorted.map(([l, n]) =>
                        `<span style="width:${(n/langTotal*100).toFixed(1)}%;background:${LANG_COLORS[l]||'#64748b'}" title="${l}: ${(n/langTotal*100).toFixed(1)}%"></span>`
                    ).join('') +
                    '</div><div class="gh-lang-legend">' +
                    sorted.map(([l, n]) =>
                        `<span class="gh-lang-item"><i style="background:${LANG_COLORS[l]||'#64748b'}"></i>${l}<em>${(n/langTotal*100).toFixed(0)}%</em></span>`
                    ).join('') + '</div>';
            }
        } catch {
            container.innerHTML = '<div class="ld-state mono">Unable to load stats.</div>';
        }
    };

    const init = () => {
        const io = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) { load(); io.disconnect(); }
        }, { rootMargin: '200px' });
        const s = document.getElementById('github');
        if (s) io.observe(s);
    };
    return { init };
})();

/* ────────────────────────────────────────
   CONTACT FORM
──────────────────────────────────────── */
const ContactForm = (() => {
    const init = () => {
        const form   = document.getElementById('contact-form');
        const status = document.getElementById('form-status');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('.submit-btn');
            const orig = btn.innerHTML;
            btn.innerHTML = '<span class="bs-inner"><i class="fas fa-spinner fa-spin"></i> Sending...</span>';
            btn.disabled = true;
            try {
                const res = await fetch(form.action, { method:'POST', body: new FormData(form), headers:{ Accept:'application/json' } });
                if (res.ok) {
                    form.reset();
                    status.textContent = '✓ Message sent! I\'ll get back to you soon.';
                    status.className = 'ok';
                } else throw new Error();
            } catch {
                status.textContent = '✗ Something went wrong. Please try again.';
                status.className = 'err';
            } finally {
                btn.innerHTML = orig; btn.disabled = false;
                setTimeout(() => { status.textContent=''; status.className=''; }, 5000);
            }
        });
    };
    return { init };
})();

/* ────────────────────────────────────────
   SMOOTH SCROLL
──────────────────────────────────────── */
const SmoothScroll = (() => {
    const init = () => {
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', e => {
                e.preventDefault();
                const t = document.querySelector(a.getAttribute('href'));
                if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    };
    return { init };
})();

/* ────────────────────────────────────────
   MAGIC UI: SPOTLIGHT CARD GLOW
──────────────────────────────────────── */
const SpotlightCards = (() => {
    const init = () => {
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r  = card.getBoundingClientRect();
                const x  = ((e.clientX - r.left) / r.width)  * 100;
                const y  = ((e.clientY - r.top)  / r.height) * 100;
                card.style.setProperty('--mx', x + '%');
                card.style.setProperty('--my', y + '%');
                card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(56,189,248,.07) 0%, transparent 60%), var(--surface)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.background = '';
            });
        });
    };
    return { init };
})();

/* ────────────────────────────────────────
   MAGIC UI: TEXT REVEAL (char-by-char)
──────────────────────────────────────── */
const TextReveal = (() => {
    const init = () => {
        const targets = document.querySelectorAll('.s-title');
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const el   = e.target;
                const text = el.textContent.trim();
                el.innerHTML = text.split('').map((c, i) =>
                    `<span style="display:inline-block;opacity:0;transform:translateY(8px);animation:charReveal .5s ${.03 * i}s forwards">${c === ' ' ? '&nbsp;' : c}</span>`
                ).join('');
                io.unobserve(el);
            });
        }, { threshold: .5 });
        targets.forEach(t => io.observe(t));
    };
    return { init };
})();

/* ────────────────────────────────────────
   PAGE TRANSITION
──────────────────────────────────────── */
const PageTransition = (() => {
    // Inject overlay DOM
    const overlay = document.createElement('div');
    overlay.id = 'page-transition';
    overlay.innerHTML = `
        <div class="pt-panel"></div>
        <div class="pt-logo">
            <svg class="pt-hex" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <polygon points="10,2 18,6 18,14 10,18 2,14 2,6" stroke="#38bdf8" stroke-width="1.2" fill="none"/>
            </svg>
            PK_
        </div>`;
    document.body.appendChild(overlay);

    const panel = overlay.querySelector('.pt-panel');
    const logo  = overlay.querySelector('.pt-logo');

    // Intercept nav link clicks for same-page anchors — animate scroll reveal
    const revealSection = (targetId) => {
        if (typeof anime === 'undefined') return;
        // Wipe in
        anime.timeline({ easing: 'cubicBezier(.76,0,.24,1)' })
            .add({ targets: panel, scaleX: [0, 1], transformOrigin: ['0% 50%', '0% 50%'], duration: 380 })
            .add({ targets: logo,  opacity: [0, 1], duration: 200 }, '-=100')
            .add({ targets: logo,  opacity: [1, 0], duration: 150 }, '+=180')
            .add({
                targets: panel,
                scaleX: [1, 0],
                transformOrigin: ['100% 50%', '100% 50%'],
                duration: 380,
                begin: () => {
                    const el = document.getElementById(targetId);
                    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
                }
            });
    };

    const init = () => {
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', (e) => {
                const href = a.getAttribute('href');
                const id   = href.replace('#', '');
                const el   = document.getElementById(id);
                if (!el) return;
                e.preventDefault();
                // Close mobile nav
                document.getElementById('hamburger')?.classList.remove('open');
                document.getElementById('navLinks')?.classList.remove('open');
                revealSection(id);
            });
        });
    };

    return { init };
})();

/* ────────────────────────────────────────
   CURSOR TRAIL + CLICK RIPPLE
──────────────────────────────────────── */
const CursorFX = (() => {
    const MAX_TRAIL  = 12;
    const trail      = [];
    let   mx = 0, my = 0;
    let   frameId;

    const mkDot = (i) => {
        const d = document.createElement('div');
        d.className = 'cursor-trail';
        const size = 6 - i * 0.35;
        d.style.cssText = `width:${size}px;height:${size}px;opacity:0;position:fixed;pointer-events:none;z-index:9990;border-radius:50%;background:var(--sky);transform:translate(-50%,-50%);will-change:transform,opacity`;
        document.body.appendChild(d);
        return { el: d, x: 0, y: 0 };
    };

    const spawnRipple = (x, y) => {
        const r = document.createElement('div');
        r.className = 'click-ripple';
        r.style.cssText = `left:${x}px;top:${y}px;width:10px;height:10px;position:fixed;pointer-events:none;z-index:9989;border-radius:50%;border:1.5px solid var(--sky);transform:translate(-50%,-50%) scale(0);will-change:transform,opacity`;
        document.body.appendChild(r);
        if (typeof anime !== 'undefined') {
            anime({
                targets: r,
                scale:   [0, 4.5],
                opacity: [0.8, 0],
                duration: 650,
                easing:  'cubicBezier(.16,1,.3,1)',
                complete: () => r.remove()
            });
        } else {
            setTimeout(() => r.remove(), 700);
        }
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
        trail.forEach((dot, i) => {
            const prev  = i === 0 ? { x: mx, y: my } : trail[i - 1];
            const speed = 0.28 - i * 0.018;
            dot.x = lerp(dot.x, prev.x, speed);
            dot.y = lerp(dot.y, prev.y, speed);
            const opacity = (1 - i / MAX_TRAIL) * 0.55;
            dot.el.style.opacity  = opacity;
            dot.el.style.left     = dot.x + 'px';
            dot.el.style.top      = dot.y + 'px';
        });
        frameId = requestAnimationFrame(tick);
    };

    const init = () => {
        if (window.innerWidth < 768) return;

        for (let i = 0; i < MAX_TRAIL; i++) trail.push(mkDot(i));

        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
        document.addEventListener('click', e => spawnRipple(e.clientX, e.clientY));
        tick();
    };

    return { init };
})();

/* ────────────────────────────────────────
   INTERACTIVE TIMELINE
──────────────────────────────────────── */
const Timeline = (() => {
    const init = () => {
        const items = document.querySelectorAll('.tl-item');
        if (!items.length) return;

        // Animate spine fill on scroll
        const spine = document.getElementById('tlSpine');
        const wrap  = document.querySelector('.timeline-wrap');

        const updateSpine = () => {
            if (!spine || !wrap) return;
            const rect   = wrap.getBoundingClientRect();
            const vh     = window.innerHeight;
            const pct    = Math.max(0, Math.min(1, (vh - rect.top) / (rect.height + vh)));
            spine.style.setProperty('--fill', (pct * 100) + '%');
        };
        window.addEventListener('scroll', updateSpine, { passive: true });

        // Animate items in on scroll
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const el  = e.target;
                const dir = el.classList.contains('tl-left') ? -40 : 40;
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: el,
                        opacity: [0, 1],
                        translateX: [dir, 0],
                        duration: 680,
                        easing: 'cubicBezier(.16,1,.3,1)'
                    });
                    // Stagger the tags inside
                    anime({
                        targets: el.querySelectorAll('.tl-tags span'),
                        opacity: [0, 1],
                        translateY: [8, 0],
                        delay: anime.stagger(60, { start: 300 }),
                        duration: 400,
                        easing: 'cubicBezier(.16,1,.3,1)'
                    });
                } else {
                    el.style.opacity = 1;
                    el.style.transform = 'none';
                }
                io.unobserve(el);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        items.forEach(el => {
            el.style.opacity = 0;
            io.observe(el);
        });
    };

    return { init };
})();

/* ────────────────────────────────────────
   MOBILE SWIPE GESTURES
──────────────────────────────────────── */
const SwipeNav = (() => {
    const sections = ['home','about','projects','timeline','publications','github','contact'];
    let startX = 0, startY = 0, startTime = 0;
    let current = 0;
    let locked  = false;

    const goTo = (id) => {
        if (locked) return;
        locked = true;
        const el = document.getElementById(id);
        if (!el) { locked = false; return; }

        if (typeof anime !== 'undefined') {
            // Flash the nav link
            const link = document.querySelector(`.nav-link[data-s="${id}"]`);
            if (link) {
                anime({ targets: link, color: ['var(--sky)', 'var(--text2)'], duration: 800, easing: 'easeOutExpo' });
            }
        }
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => { locked = false; }, 900);
    };

    const updateCurrent = () => {
        sections.forEach((id, i) => {
            const el = document.getElementById(id);
            if (!el) return;
            const rect = el.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.4 && rect.bottom > 0) current = i;
        });
    };

    // Touch swipe — horizontal swipe opens/closes mobile nav, vertical navigates sections
    const initTouch = () => {
        document.addEventListener('touchstart', e => {
            startX    = e.touches[0].clientX;
            startY    = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });

        document.addEventListener('touchend', e => {
            const dx   = e.changedTouches[0].clientX - startX;
            const dy   = e.changedTouches[0].clientY - startY;
            const dt   = Date.now() - startTime;
            const absx = Math.abs(dx), absy = Math.abs(dy);

            if (dt > 400) return; // too slow

            // Horizontal: swipe right from left edge → open nav; swipe left → close nav
            if (absx > absy && absx > 55) {
                const nav = document.getElementById('navLinks');
                const hbg = document.getElementById('hamburger');
                if (!nav || !hbg) return;
                if (dx > 0 && startX < 40) {
                    nav.classList.add('open'); hbg.classList.add('open');
                } else if (dx < 0 && nav.classList.contains('open')) {
                    nav.classList.remove('open'); hbg.classList.remove('open');
                }
                return;
            }

            // Vertical swipe: disabled to allow natural free-scroll on mobile
        }, { passive: true });
    };

    // Keyboard arrow navigation (bonus)
    const initKeyboard = () => {
        document.addEventListener('keydown', e => {
            if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
            updateCurrent();
            if ((e.key === 'ArrowDown' || e.key === 'PageDown') && current < sections.length - 1) {
                e.preventDefault();
                goTo(sections[current + 1]);
            }
            if ((e.key === 'ArrowUp' || e.key === 'PageUp') && current > 0) {
                e.preventDefault();
                goTo(sections[current - 1]);
            }
        });
    };

    const init = () => {
        initTouch();
        initKeyboard();
    };

    return { init };
})();


/* ────────────────────────────────────────
   ANIMATED GRID PATTERN (MagicUI-style)
   numSquares=30, maxOpacity=0.1,
   duration=3s, repeatDelay=1s,
   radial-gradient mask + skewY(12deg)
──────────────────────────────────────── */
const AnimatedGridPattern = (() => {
    const TARGETS     = ['about', 'projects', 'timeline', 'publications', 'github'];
    const CELL        = 60;          // px per grid cell
    const NUM_SQUARES = 30;          // concurrent animated squares
    const MAX_OPACITY = 0.10;        // maxOpacity
    const DURATION    = 3000;        // ms fade-in + fade-out cycle
    const REPEAT_DEL  = 1000;        // ms pause before respawn

    class GridCanvas {
        constructor(container) {
            this.container = container;
            this.canvas    = document.createElement('canvas');
            this.ctx       = this.canvas.getContext('2d');
            this.animating = [];
            this.cols      = 0;
            this.rows      = 0;

            this.canvas.className = 'agp-canvas';
            container.classList.add('section-grid');
            container.insertBefore(this.canvas, container.firstChild);

            this.resize();
            this._roHandler = () => this.resize();
            const ro = new ResizeObserver(this._roHandler);
            ro.observe(container);

            // Stagger initial spawns
            for (let i = 0; i < NUM_SQUARES; i++) {
                setTimeout(() => this._spawnSquare(), i * ((DURATION + REPEAT_DEL) / NUM_SQUARES));
            }
            this._loop();
        }

        resize() {
            const rect  = this.container.getBoundingClientRect();
            const w     = rect.width  * 1.2;       // extra for skew bleed
            const h     = rect.height * 2.0;
            this.canvas.width  = Math.round(w);
            this.canvas.height = Math.round(h);
            this.cols = Math.ceil(w / CELL) + 1;
            this.rows = Math.ceil(h / CELL) + 1;
        }

        _accent() {
            return document.documentElement.getAttribute('data-theme') === 'light'
                ? 'rgba(2,132,199,'     // light theme sky
                : 'rgba(56,189,248,';   // dark theme sky
        }

        _spawnSquare() {
            if (!this.cols || !this.rows) return;
            const sq = {
                col  : Math.floor(Math.random() * this.cols),
                row  : Math.floor(Math.random() * this.rows),
                start: performance.now()
            };
            this.animating.push(sq);
            // Respawn after full cycle
            setTimeout(() => {
                const idx = this.animating.indexOf(sq);
                if (idx !== -1) this.animating.splice(idx, 1);
                this._spawnSquare();
            }, DURATION + REPEAT_DEL);
        }

        _draw(now) {
            const { ctx, canvas } = this;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const a = this._accent();

            // Grid lines (very faint)
            ctx.strokeStyle = a + '0.045)';
            ctx.lineWidth   = 1;
            ctx.beginPath();
            for (let c = 0; c <= this.cols; c++) {
                ctx.moveTo(c * CELL, 0);
                ctx.lineTo(c * CELL, canvas.height);
            }
            for (let r = 0; r <= this.rows; r++) {
                ctx.moveTo(0, r * CELL);
                ctx.lineTo(canvas.width, r * CELL);
            }
            ctx.stroke();

            // Animated squares — ease-in-out over DURATION
            const half = DURATION / 2;
            for (const sq of this.animating) {
                const e  = now - sq.start;
                let   t  = e < half ? e / half : 1 - (e - half) / half;
                t = Math.max(0, Math.min(1, t));            // clamp
                t = t * t * (3 - 2 * t);                    // smoothstep
                ctx.fillStyle = a + (t * MAX_OPACITY) + ')';
                ctx.fillRect(sq.col * CELL, sq.row * CELL, CELL, CELL);
            }
        }

        _loop() {
            const tick = (now) => { this._draw(now); requestAnimationFrame(tick); };
            requestAnimationFrame(tick);
        }
    }

    const init = () => {
        TARGETS.forEach(id => {
            const el = document.getElementById(id);
            if (el) new GridCanvas(el);
        });
    };

    return { init };
})();

const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes charReveal{to{opacity:1;transform:translateY(0)}}`;
document.head.appendChild(styleTag);

/* ────────────────────────────────────────
   INIT
──────────────────────────────────────── */
const boot = () => {
    ThemeManager.init();
    ScrollProgress.init();
    Nav.init();
    SmoothScroll.init();
    PageTransition.init();
    AOS.init();
    Counters.init();
    TypedRole.init();
    Timeline.init();
    Projects.init();
    Publications.init();
    GitHubStats.init();
    ContactForm.init();
    TextReveal.init();
    SwipeNav.init();

    // Delay heavier stuff
    requestIdleCallback ? requestIdleCallback(() => {
        Cursor.init();
        Magnetic.init();
        SpotlightCards.init();
        CursorFX.init();
    }) : setTimeout(() => { Cursor.init(); Magnetic.init(); SpotlightCards.init(); CursorFX.init(); }, 200);

    // Hero runs after loader fades
    setTimeout(HeroEntrance.init, 150);

    // Three.js after fonts settle
    setTimeout(RobotScene.init, 300);

    // Animated grid pattern sections (MagicUI-style)
    AnimatedGridPattern.init();
};

Loader.start();
document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
