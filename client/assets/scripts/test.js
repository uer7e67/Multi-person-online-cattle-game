
cc.Class({
    extends: cc.Component,

    properties: {
        n1 : cc.Node, 
    },

    // LIFE-CYCLE CALLBACKS:
    // var cards = [ 
    //     'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13',
    //     'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13',
    //     'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13',
    //     'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13',
    // ];
    // A 方块 B 梅花 C 黑桃 D 红桃

    onLoad () {
        this.card = this.node.getChildByName("card").getComponent("Card"); 
        var info = this.card_transform('D11')
        this.card.init(info); 
    },

    card_transform(str){
        var huase = str.substring(0, 1);
        var point = parseInt(str.substring(1, str.length));  
        var card = {}; 

        switch (huase) {
            case 'A':
                card.isRedSuit = true;  
                card.suit = 1; 
                break;
            case 'B':
                card.isRedSuit = false;  
                card.suit = 2; 
                break;
            case 'C':
                card.isRedSuit = false;  
                card.suit = 3; 
                break;
            case 'D':
                card.isRedSuit = true;  
                card.suit = 4; 
                break;

            default:
                break;
        }  

        cc.log(point);
        
        if(point == 1){
            card.point = point; 
            card.pointName = 'A'; 
        }
        if(point <= 10 && point > 1){
            card.point = point; 
            card.pointName = point; 
        }
        if(point > 10){
            switch (point) {
                case 11:
                    card.point = point; 
                    card.pointName = 'J'; 
                    break;
                case 12:
                    card.point = point; 
                    card.pointName = 'Q'; 
                    break;
                case 13:
                    card.point = point; 
                    card.pointName = 'K'; 
                    break;
                default:
                    break;
            }
        }

        return card; 
    },  


    start () {

    },

    // update (dt) {},
});

