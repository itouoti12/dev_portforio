
/**
 * 要素が一部でも画面内に表示されているか
 * @param element 
 * @param viewHeight 
 * @returns 
 */
export function  isElementAppear (element:Element,viewHeight:number) {
    return 0 < element.getBoundingClientRect().bottom && element.getBoundingClientRect().top < viewHeight;

}