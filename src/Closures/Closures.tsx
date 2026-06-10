/* closures big problem is stale closures
closure compiletion phase madhe create hoto.
closures is just phenomenon
closure ha nhemi create nhi hoth inner function jr parent functi on ch variable use krt asel tr ch closure banto. function call kel nhi tri closure banto. console.dir(functionname) chya output madhe scope navachi property aahe tya mdeh closure property aste.

closure elimination :
closures preservation : 

advantages : private varible, encapsulation, data hiding
function getInfo(){
    let money = "0";
    function process(){}
    function init(){}
    function start(){
        process(); // data hiding
    }

    function getMyMoney(role){
        if(role!=="admin")return "no access";
        return money;
    }
    return {getMyMoney, start};
}
*/

const Closures = () => {
    return(
        <div>
             
        </div>
    )
}

export default Closures;

