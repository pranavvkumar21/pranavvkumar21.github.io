# Image Placeholders

Drop your images here and update the `src` attributes in `index.html`.

| Filename              | Used in  | Description                                                |
|-----------------------|----------|------------------------------------------------------------|
| `port_bg.jpg`         | Slide 1  | Cinematic port / aerial dock photo. Landscape, high-res.   |
| `progeny_arch.png`    | Slide 3  | PROGENY MPF architecture diagram (annotated).              |
| `traj_full_sensor.png`| Slide 4  | Diffusion model output — full sensor suite trajectory.     |
| `traj_gps_drop.png`   | Slide 4  | Diffusion model output — GPS-dropped trajectory.           |
| `rl_quadruped.png`    | Slide 5  | Quadruped locomotion screenshot (IsaacLab / Isaac Sim).    |
| `rl_humanoid.png`     | Slide 5  | Unitree G1 motion imitation screenshot.                    |
| `rl_drones.png`       | Slide 5  | Multi-drone crate pickup/placement screenshot.             |
| `gcs_screenshot.png`  | Slide 6  | GCS interface — mission planning view, landscape crop.     |

## Usage

Once an image is placed here, replace the corresponding placeholder `<div class="img-placeholder ...">` in `index.html`
with a standard `<img>` tag, e.g.:

```html
<img src="assets/images/port_bg.jpg" alt="Port background"
     style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.35;filter:grayscale(40%);">
```
