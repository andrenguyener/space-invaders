export const checkCollisionsWith = (items1, items2) => {
    let a = items1.length - 1;
    let b;
    for (a; a > -1; --a) {
        b = items2.length - 1;
        for (b; b > -1; --b) {
            let item1 = items1[a];
            let item2 = items2[b];
            if (checkCollision(item1, item2)) {
                item1.subtractLife();
                item2.subtractLife();
                // check if invader reaches bottom of map and end game...
                if (item1.life === 0) {
                    item1.die();
                }
                if (item2.life === 0) {
                    item2.die();
                }
            }
        }
    }
};

export const checkCollision = (obj1, obj2) => {
    let vx = obj1.position.x - obj2.position.x;
    let vy = obj1.position.y - obj2.position.y;
    let length = Math.sqrt(vx * vx + vy * vy);
    if (length < obj1.radius + obj2.radius) {
        return true;
    }
    return false;
};
