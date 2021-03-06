import dat from "dat.gui";

/**
Game of Life | Pjkarlik

Any dead cell with exactly three live neighbours becomes
a live cell, as if by reproduction

Any live cell with fewer than two live neighbours dies,
as if by underpopulation.

Any live cell with more than three live neighbours dies,
as if by overpopulation.

Any live cell with two or three live neighbours lives
on to the next generation.

Click screen to restart with new random parameters. 
*/
const clone = array => {
  return JSON.parse(JSON.stringify(array));
};

// Parent Render Class
class Render {
  constructor() {
    this.frame = 0;
    this.canvas = this.createCanvas("canvas");
    this.animation = null;
    this.points = [];
    this.hue = ~~(Math.random() * 360);
    this.bkg = [
      ~~(Math.random() * 255),
      ~~(Math.random() * 255),
      ~~(Math.random() * 255)
    ];
    this.blur = 88;
    this.grid = 5;
    this.cols = ~~(this.width / this.grid);
    this.rows = ~~(this.height / this.grid);
    window.addEventListener("resize", this.resetCanvas);
    this.canvas.addEventListener("click", this.resetCanvas);

    this.createGui();
    this.generateCubics();
    this.renderLoop();
  }

  setViewport = element => {
    const canvasElement = element;
    const dc = document.documentElement;
    this.width = ~~(dc.clientWidth, window.innerWidth || 0);
    this.height = ~~(dc.clientHeight, window.innerHeight || 0);
    canvasElement.width = this.width;
    canvasElement.height = this.height;
  };

  createCanvas = name => {
    const canvasElement = document.createElement("canvas");
    canvasElement.id = name;
    this.setViewport(canvasElement);
    document.body.appendChild(canvasElement);
    this.surface = canvasElement.getContext("2d");
    this.surface.scale(1, 1);
    return canvasElement;
  };

  resetCanvas = () => {
    window.cancelAnimationFrame(this.animation);
    this.setViewport(this.canvas);
    this.cols = ~~(this.width / this.grid);
    this.rows = ~~(this.height / this.grid);
    this.hue = ~~(Math.random() * 360);
    this.bkg = [
      ~~(Math.random() * 255),
      ~~(Math.random() * 255),
      ~~(Math.random() * 255)
    ];
    this.points = [];
    this.generateCubics();
    this.renderLoop();
  };

  createGui = () => {
    this.options = {
      grid: this.grid,
      blur: this.blur
    };
    this.gui = new dat.GUI();
    const folderRender = this.gui.addFolder("Render Options");
    folderRender
      .add(this.options, "grid", 2, 100)
      .step(1)
      .onFinishChange(value => {
        this.grid = value;
        this.resetCanvas();
      });
    folderRender
      .add(this.options, "blur", 1, 100)
      .step(0.01)
      .onFinishChange(value => {
        this.blur = value;
      });
  };

  generateCubics = () => {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.points.push(Math.round(Math.random()));
      }
    }
    this.clone = clone(this.points);
  };

  drawSquare = point => {
    const offx = this.width / 2 - (this.cols * this.grid) / 2;
    const offy = this.height / 2 - (this.rows * this.grid) / 2;

    const x = point.x * this.grid;
    const y = point.y * this.grid;
    this.surface.beginPath();
    this.surface.fillStyle = `hsla(${this.hue + this.frame * 0.15},100%,50%,1)`;
    this.surface.strokeStyle = "rgba(0,0,0,0)";
    this.surface.fillRect(offx + x, offy + y, this.grid, this.grid);
    this.surface.fill();
  };

  drawFrame = () => {
    const blr = 0.9 - this.blur * 0.01;
    this.surface.fillStyle = `rgba(${this.bkg[0]},${this.bkg[1]},${this.bkg[2]},${blr})`;
    this.surface.fillRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.points.length; i++) {
      const x = i % this.cols;
      const y = ~~((i - x) / this.cols);
      //console.log(x,y);
      if (this.points[i]) {
        this.drawSquare({ x, y });
      }
    }
    // const sw = .5 * Math.sin(this.frame*.05);
    // this.surface.drawImage(
    //   this.canvas,
    //   2,
    //   sw,
    //   this.canvas.width + 2,
    //   this.canvas.height+sw
    // );
  };

  // the Moore neighborhood is defined on a two-dimensional
  // square lattice and is composed of a central cell and the
  // eight cells that surround it.
  addNeighboors = (dx, dy) => {
    let total = 0;
    let holder = [];
    const mypos = dy * this.cols + dx;

    for (let y = -1; y < 2; y += 1) {
      for (let x = -1; x < 2; x += 1) {
        let myx = dx + x;
        // -1, 0 ,1 + x then check for wrap around
        if (myx < 0) {
          myx = this.cols + x;
        } else if (myx > this.cols - 1) {
          myx = x - 1;
        }

        let myy = dy + y;
        // -1, 0 ,1 + y then check for wrap around
        if (myy < 0) {
          myy = this.rows + y;
        } else if (myy > this.rows - 1) {
          myy = y - 1;
        }
        // add all values except center
        const npos = myy * this.cols + myx;
        if (mypos !== npos) {
          total += this.clone[npos];
        }
      }
    }

    return total;
  };

  updateFrame = () => {
    this.clone = clone(this.points);
    for (let i = 0; i < this.points.length; i++) {
      const x = i % this.cols;
      const y = ~~((i - x) / this.cols);
      //if(this.frame%200) console.log(x,y);
      const total = this.addNeighboors(x, y);
      if (this.points[i] === 1) {
        switch (total) {
          case 0:
          case 1:
            this.points[i] = 0;
            break;
          case 2:
            this.points[i] = 1;
          case 3:
            this.points[i] = 1;
            break;
          case 4:
          case 5:
          case 6:
          case 7:
          case 8:
            this.points[i] = 0;
            break;
          default:
            this.points[i] = 0;
        }
      }
      if (this.points[i] === 0) {
        switch (total) {
          case 3:
            this.points[i] = 1;
            break;
          default:
            this.points[i] = 0;
        }

        // to prevent total death - slight random life
        if (Math.random() * 300 > 299.98) this.points[i] = 1;
      }
    }
  };

  renderLoop = () => {
    this.frame++;

    if (this.frame % 2 === 0) this.updateFrame();

    this.drawFrame();

    this.animation = window.requestAnimationFrame(this.renderLoop);
  };
}

export default Render;
