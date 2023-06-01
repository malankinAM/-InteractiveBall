

window.addEventListener('load',() => {

    let height, width;
    let canvas = doc.qs('canvas');
    let context = canvas.getContext('2d');
    let animate;

    const config = {
        radius:50,
        gravity: 0.525,
        elasticity:0.6
    };

    function onResize(){
        height = doc.height;
        width = doc.width;
        canvas.height = height;
        canvas.width = width;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.fillStyle = 'red';
    }
    addEventListener('resize', onResize, false);
    onResize();

    let c = {
        x: width/2,
        y: height/2,
        lx: 0,
        ly:0,
        xDragOffset:0,
        yDragOffset:0,
        dragging:false,
        mouseInside: false,
        lastValues: [],
        gAcceleration:0,
        xAcceleration:5,
        yAcceleration:0,
        path: [],
        weight:50,
        t1: 0,
        t2:0,
        raf: null
    };

    context.beginPath();
    context.arc(c.x, c.y, config.radius, 0, Math.PI * 2, false);
    context.fill();
    context.closePath();

    addEventListener('mousedown', (e)=> {

        if(c.mouseInside){
            c.dragging = true;
            c.gAcceleration = 0;
            cancelAnimationFrame(c.raf);
        }

    }, false);

    addEventListener('mousemove', (e)=> {
			
				document.body.style.cursor = (c.mouseInside)? 'pointer' : 'default';

        let x = e.clientX,
            y = e.clientY;

        if(!c.dragging){

            let vector = Math.sqrt( Math.pow( x-c.x, 2) + Math.pow( y-c.y, 2) );
            if(vector <= config.radius){
                c.mouseInside = true;
                c.xDragOffset = c.x - x;
                c.yDragOffset = c.y - y;
            }else{
                c.mouseInside = false;
            }

        }else{

            c.x = e.clientX + c.xDragOffset;
            c.y = e.clientY + c.yDragOffset;

            let lv = {
                x: c.x,
                y: c.y
            };

            if(5 <= c.lastValues.length)  c.lastValues.shift();
            c.lastValues.push(lv);
            c.t1 = performance.now();

            c.path.push({
                x: c.x,
                y: c.y
            });

            if(c.path.length > 10){
                c.path.shift();
            }

            context.clearRect(0,0,width,height);

            drawTail();

        }


    }, false);

    function changeFillColor(){
        context.fillStyle = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    }
	
		function drawTail(){
			
			 let i = 0,
						size = 0;
			
        for(let v of c.path){
						size = size+0.001 + size*0.037;
						if(size>1) size = 1;
            i++;
            context.beginPath();
            context.save();
            if(i === c.path.length){
	
							context.arc(v.x, v.y, config.radius, 0, Math.PI * 2, false);	
							
            }else{
              context.globalAlpha = 0.0035*i;
							context.scale(1*size,1*size);
							context.arc(v.x/size, v.y/size, config.radius, 0, Math.PI * 2, false);
            }
            context.fill();
            context.restore();
            context.closePath();
        }
			
		}

    animate = ()=> {

        if(c.dragging) return;

        c.gAcceleration += config.gravity;

        let sy = c.yAcceleration*0.999 + c.gAcceleration;
        let sx = c.xAcceleration*0.999;

        c.x += sx;
        c.y += sy;

        if(c.x >= width - config.radius){
            c.x = width - config.radius;
            c.xAcceleration = -sx/(config.elasticity/config.gravity)*0.8;
        }else if(c.x <= config.radius){
					  c.x = config.radius;
            c.xAcceleration = -sx/(config.elasticity/config.gravity)*0.8;
				} else if(c.y >= height - config.radius){
					c.y = height - config.radius;
            c.gAcceleration = 0;
            c.yAcceleration = -sy/(config.elasticity/config.gravity);
            c.xAcceleration = sx/1.001;
				}else if(c.y <= config.radius){
						c.y = config.radius;
            c.gAcceleration = 0;
            c.yAcceleration = -sy/(config.elasticity/config.gravity);			 
				}

        c.path.push({
            x: c.x,
            y: c.y
        });

        if(c.path.length > 100){
            c.path.shift();
        }

        context.clearRect(0,0,width,height);
			
        drawTail();

        c.lx = c.x;
        c.ly = c.y;

        c.raf = requestAnimationFrame(animate);

    };

    animate();

    addEventListener('mouseup', (e)=> {

        if(!c.mouseInside) return;

        c.dragging = false;
        c.t2 = (performance.now() - c.t1);

        c.xAcceleration = (c.lastValues[c.lastValues.length-1].x - c.lastValues[0].x) / c.t2;
        c.yAcceleration = (c.lastValues[c.lastValues.length-1].y - c.lastValues[0].y) / c.t2;
			
			  c.xAcceleration -= c.xAcceleration*0.35;
				c.yAcceleration -= c.yAcceleration*0.35;
			
        animate();

    }, false);



}, false);

let log = console.log;

class doc {
	static get height(){
		return document.documentElement.clientHeight;
	}
    static get width(){
        return document.documentElement.clientWidth;
    }
    static qs(selector){
        return document.querySelectorAll(selector)[0];
    }
    static qsa(selector){
        return document.querySelectorAll(selector);
    }
}

Math.rnd = (min, max) => {
    if(typeof min === 'undefined' || typeof max === 'undefined') return Math.round(Math.random());
    return (min + Math.random() * (max - min));
};

Math.toRad = (deg) => {
    return deg * Math.PI / 180;
};