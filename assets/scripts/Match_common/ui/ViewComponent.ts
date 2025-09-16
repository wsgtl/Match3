import { Component, Node } from "cc"
/**视图组件 */
export default class ViewComponent extends Component{
    /**显示
     * @param parent 父节点
     * @param args 自定义传入参数
     */
    show(parent:Node,args?:any){
        parent.addChild(this.node);
        this.showStart(args);
    }
    showStart(args?:any){

    }
}