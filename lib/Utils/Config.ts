/**
 * @module Lib/Utils
 **/

/**
 * Classe chargée de la gestion des configurations
 *
 * La structure de la configuration doit être contrôlée ainsi l'absence
 * d'une configuration déclenche une erreur, de la même manière la réécriture
 * d'une configuration qui n'aurait pas était définie à l'instanciation de la
 * classe déclenche elle aussi une erreur
 *
 * @example
 * ```
 *
 *
 * const globalConfig = new Config({
 *     foo : 'bar',
 *     env : 'production',
 *     verbose : true,
 *     list : [
 *         'a', 'b', 'c'
 *     ],
 *     mongo : {
 *         host : 'localhost'
 *     }
 * });
 *
 * // récupération d'une donnée existante
 * const foo = globalConfig.get('foo');
 * const mongoConfig = globalConfig.get('mongo');
 * const mongoHost = globalConfig.get('mongo.host');
 *
 * // cette demande provoque une exception
 * const mongoLogin = globalConfig.get('mongo.login');
 *
 * // setting d'informations
 * globalConfig.set('foo', 'fou');
 * globalConfig.set('mongo', {
 *     host : 'haha'
 * });
 *
 * // dans le cas ou la variable n'a pas était définis à l'instanciation
 * // cela provoque une exception
 * globalConfig.set('mongo.login', 'aaaa');
 *
 * // récupère un sous objet configuration
 * const mongoConfig = globalConfig.getSub('mongo');
 * const host = mongoConfig.get('mongo');
 *
 * // champs optionnels
 * const login = mongoConfig.isset('login') ? mongoConfig.get('login') : 'root';
 * // équivalent à
 * const login2 = mongoConfig.getOrReturn('login', 'root');
 * ```
 * @module Utils/Config
 */
export default class Config {

    private _data;

    /**
     * Initialise la configuration passée en paramètre
     *
     * dans le cas ou des sous objets seraient présent
     * la classe config est instanciée de manière recursive
     * pour permettre de contrôler les propriétées demandées
     * ou modifiées à tous les niveaux
     */
    constructor(inputDatas: any) {

        let datas = this._data = {};

        if(!(inputDatas instanceof Object)) {
            throw new Error('invalid config data');
        }

        if(inputDatas instanceof Config) {
            inputDatas = inputDatas.getData();
        }

        for(let key in inputDatas) {
            if(inputDatas.hasOwnProperty(key)) {
                let inputData = inputDatas[key];
                if(inputData instanceof Object && !Array.isArray(inputData)) {
                    datas[key] = new Config(inputData);
                } else {
                    datas[key] = inputData;
                }
            }
        }
    }

    /**
     * Renvoi la valeur désirée quelques soit son niveau
     * @method get
     * @param  {String} path         Chemin vers la prop désirée
     * @param  {String} initialPath  Chemin initial (utilisé dans la récursion)
     * @return {Mixed}               La propriétée demandée
     */
    public get(path: string, initialPath?: string) : any {

        let key,
            data = this._data,
            index = path.indexOf('.');

        if(!initialPath) {
            initialPath = path;
        }

        if(index >= 0) {
            key = path.substring(0, index);
            path = path.substring(index + 1);
        }

        if((key && typeof data[key] === 'undefined') || (!key && typeof data[path] === 'undefined')) {
            throw new Error('undefined config ' + path + ' for path ' + initialPath);
        }

        if(key) {
            return data[key].get(path, initialPath);
        } else {
            if(data[path] instanceof Config) {
                return data[path].getData();
            } else {
                return data[path];
            }
        }
    }

    /**
     * Retourne la valeur de la propriétée visée si elle existe
     * dans le cas contraire c'est la valeur par défaut qui est envoyée
     * @param  path     chemin vers la propriété à récupérer
     * @param  defValue valeur à appliquer si la propriétée n'est pas définie
     * @return          valeur définie ou par défaut
     */
    public getOrReturn(path: string, defValue: any) : any {

        return (this.isset(path) ? this.get(path) : defValue);
    }

    /**
     * Renvoi un object configuration depuis le chemin passé en paramètre
     */
    public getSub(path: string, initialPath?: string) : Config {

        let key,
            data = this._data,
            index = path.indexOf('.');

        if(!initialPath) {
            initialPath = path;
        }

        if(index >= 0) {
            key = path.substring(0, index);
            path = path.substring(index + 1);
        }

        if((key && typeof data[key] === 'undefined') || (!key && typeof data[path] === 'undefined')) {
            throw new Error('undefined config ' + path + ' for path ' + initialPath);
        }

        if(key) {
            return data[key].get(path, initialPath);
        } else {
            return data[path];
        }
    }

    /**
     * Permet de setter une valeur quelques soit sont niveau
     */
    public set(path : string, value : any, initialPath?: string) : void {

        let key,
            data = this._data,
            index = path.indexOf('.');

        if(!initialPath) {
            initialPath = path;
        }

        if(index >= 0) {
            key = path.substring(0, index);
            path = path.substring(index + 1);
        }

        if((key && typeof data[key] === 'undefined') || (!key && typeof data[path] === 'undefined')) {
            throw new Error('undefined config ' + path + ' for path ' + initialPath);
        }

        if(key) {
            data[key].set(path, value, initialPath);
        } else {
            if(data[path] instanceof Config) {
                data[path].setData(value);
            } else {
                data[path] = value;
            }
        }
    }

    /**
     * Renvoi toutes les données contenus dans l'instance
     */
    public getData() : any {

        let outDatas = {},
            data = this._data;

        for(let key in data) {
            if(data.hasOwnProperty(key)) {
                if(data[key] instanceof Config) {
                    outDatas[key] = data[key].getData();
                } else {
                    outDatas[key] = data[key];
                }
            }
        }
        return outDatas;
    }

    /**
     * Set toutes les données de l'instance
     * @return {void}
     */
    public setData(inputDatas: any) {

        let data = this._data;

        if(!(inputDatas instanceof Object)) {
            throw new Error('invalid config data');
        }

        for(let key in inputDatas) {
            if(inputDatas.hasOwnProperty(key)) {
                if(typeof data[key] === 'undefined') {
                    throw new Error('override properties not allowed');
                }
                if(data[key] instanceof Config) {
                    data[key].setData(inputDatas[key]);
                } else {
                    data[key] = inputDatas[key];
                }
            }
        }
    }

    /**
     * Vérifie qu'une propriété existe
     */
    public isset(path : string) : boolean {
        try {
            this.get(path);
            return true;
        } catch(err) {
            return false;
        }
    }
}
