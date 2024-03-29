const PIXI = require('pixi.js');

export class Video extends PIXI.Container {
    constructor(WBS, sourceWrapper, id, texture) {
        super();

        this._dragging = false;

        this._focused = false;

        this._WBS = WBS;

        this._sourceWrapper = sourceWrapper;

        this._id = id;

        this._texture = texture;

        this._sprite = PIXI.Sprite.from(this._texture);
        this._sprite.name = 'sprite';

        this._blueBox = new PIXI.Graphics();

        this._initSprite();

        this._setMouseEventListener();

        this._setTextureUpdateListener();
        
        this._addToContainer();
    }

    _initSprite() {
        this._sprite.anchor.set(0.5);
        this._sprite.x = this._WBS.appWidth / 2 + 1; // add one just to avoid the weird line (don't konw how the line appears)
        this._sprite.y = this._WBS.appHeight / 2 + 1;
        this._focused = false;
    }

    _setMouseEventListener() {
        this._setOnMouseDownEventListener();
        this._setOnMouseMoveEventListener();
        this._setOnMouseUpEventListener();
        this._setOnMouseOverEventListener();
        this._setOnMouseOutEventListener();
    }

    _setOnMouseDownEventListener() {
        self.addEventListener("onmousedown", (e) => {
            const posX = e.detail.position.x;
            const posY = e.detail.position.y;

            const xLeft = this._sprite.x - this._sprite.width / 2 + 7;
            const xRight = this._sprite.x + this._sprite.width / 2 - 7;
            const yTop = this._sprite.y - this._sprite.height / 2 + 7;
            const yBottom = this._sprite.y + this._sprite.height / 2 - 7;

            const isInX = xLeft <= posX && xRight >= posX;
            const isInY = yTop <= posY && yBottom >= posY;
            const isInside = isInX && isInY;

            if (isInside) this._spriteOnMouseDown(posX, posY);
        });
    }

    _setOnMouseMoveEventListener() {
        self.addEventListener("onmousemove", (e) => {
            const posX = e.detail.position.x;
            const posY = e.detail.position.y;

            this._spriteOnMouseMove(posX, posY);
        });
    }

    _setOnMouseUpEventListener() {
        self.addEventListener("onmouseup", (e) => {
            this._spriteOnMouseUp();
        });
    }

    _setOnMouseOverEventListener() {
        self.addEventListener("onmousemove", (e) => {
            const posX = e.detail.position.x;
            const posY = e.detail.position.y;

            const xLeft = this._sprite.x - this._sprite.width / 2 + 7;
            const xRight = this._sprite.x + this._sprite.width / 2 - 7;
            const yTop = this._sprite.y - this._sprite.height / 2 + 7;
            const yBottom = this._sprite.y + this._sprite.height / 2 - 7;

            const isInX = xLeft <= posX && xRight >= posX;
            const isInY = yTop <= posY && yBottom >= posY;
            const isInside = isInX && isInY;

            if (isInside) this._spriteOnMouseOver();
        });
    }

    _setOnMouseOutEventListener() {
        self.addEventListener("onmousemove", (e) => {
            const posX = e.detail.position.x;
            const posY = e.detail.position.y;

            const xLeft = this._sprite.x - this._sprite.width / 2 + 7;
            const xRight = this._sprite.x + this._sprite.width / 2 - 7;
            const yTop = this._sprite.y - this._sprite.height / 2 + 7;
            const yBottom = this._sprite.y + this._sprite.height / 2 - 7;

            const isOutX = xLeft > posX || xRight < posX;
            const isOutY = yTop > posY || yBottom < posY;
            const isOutside = isOutX || isOutY;

            if (isOutside) this._spriteOnMouseOut();
        });
    }

    _spriteOnMouseDown(posX, posY) {
        this._blueBox.clear();
        this._sourceWrapper.focusBox.setFocusedTarget(this);
        this._showFocusBox();

        this._WBS.setCursor("move");

        this._focused = true;
        this._dragging = true;

        this._sourceWrapper.unfocusedWithout(this, false);

        this._sprite.prevInteractX = posX;
        this._sprite.prevInteractY = posY;
    }

    setDragging(state) {
        this._dragging = state;
    }

    _showFocusBox() {
        if (!this._focused) {
            let width = this._sprite.width;
            let height = this._sprite.height;
            let bounds = this._sprite.getBounds();
            this._sourceWrapper.focusBox.drawFocusBox(bounds.x, bounds.y, width, height);
        }
    }

    _spriteOnMouseMove(posX, posY) {
        if (this._dragging) {
            const deltaX = posX - this._sprite.prevInteractX;
            const deltaY = posY - this._sprite.prevInteractY;

            this._moveSprite(deltaX, deltaY);
            this._sourceWrapper.focusBox.moveFocusBox(deltaX, deltaY);

            this._sprite.prevInteractX = posX;
            this._sprite.prevInteractY = posY;
        }
    }

    _moveSprite(deltaX, deltaY) {
        this._sprite.x = this._sprite.x + deltaX;
        this._sprite.y = this._sprite.y + deltaY;
    }

    _spriteOnMouseUp() {
        this._dragging = false;

        this._WBS.setCursor("auto");
    }

    _spriteOnMouseOver() {
        if (!this._focused) {
            this._drawBlueBox();
        }
    }

    _drawBlueBox() {
        this._blueBox.lineStyle(4, 0x00AEB9);
        this._blueBox.drawShape(this._sprite.getBounds());
    }

    _spriteOnMouseOut() {
        if (!this._focused) {
            this._blueBox.clear();
        }
    }

    isClickInsideSprite(x, y) {
        const isBiggerThanLeft = (x >= this._sprite.x - (this._sprite.width / 2) - 8);
        const isSmallerThanRight = (x <= this._sprite.x + (this._sprite.width / 2) + 8);
        const isInsideSpriteX = (isBiggerThanLeft && isSmallerThanRight);

        const isBiggerThanTop = (y >= this._sprite.y - (this._sprite.height / 2) - 8);
        const isSmallerThanBottom = (y <= this._sprite.y + (this._sprite.height / 2) + 8);
        const isInsideSpriteY = (isBiggerThanTop && isSmallerThanBottom);

        return (isInsideSpriteX && isInsideSpriteY);
    }

    _setTextureUpdateListener() {
        let isSpriteSet = false;
        let lastBounds = this._sprite.getBounds();

        this._texture.on("update", () => {
            if (this._texture.width === 2 && this._texture.height === 2) {
                if (isSpriteSet) return;
                this._sprite.x = lastBounds.x + lastBounds.width / 2;
                this._sprite.y = lastBounds.y + lastBounds.height / 2;
                this._sprite.width = lastBounds.width;
                this._sprite.height = lastBounds.height;
                this._sprite.texture = this._createCoverTexture(lastBounds);
                isSpriteSet = true;
            } else {
                if (isSpriteSet) this._sprite.texture = this._texture;
                isSpriteSet = false;
                lastBounds = this._sprite.getBounds();
            }
        }, this);
    }

    _createCoverTexture(lastBounds) {
        let cover = new PIXI.Graphics();

        cover.beginFill(0x5C5C5C, 0.6);
        cover.drawShape(lastBounds);
        cover.endFill();

        return this._WBS.getApplication().renderer.generateTexture(cover);
    }

    _addToContainer() {
        this.addChild(this._sprite);
        this.addChild(this._blueBox);
    }

    setOnFoucsState(state) {
        this._focused = state;
    }

    getFocusState() {
        return this._focused;
    }

    getDraggingState() {
        return this._dragging;
    }

    resize(x, y, width, height) {
        this._sprite.x = x;
        this._sprite.y = y;
        this._sprite.width = width;
        this._sprite.height = height;
    }

    destroy() {
        this.destroy({
            children: true,
            texture: true,
            baseTexture: true
        });
    }
}