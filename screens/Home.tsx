import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react'
import {View, Text, ActivityIndicator, StyleSheet, Image} from 'react-native'
import { FlatList, ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import {host} from '../config/settings'
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("appvenda.db");

const Stack = createStackNavigator();

export default function Home(){

    return(
        <Stack.Navigator>
            <Stack.Screen name="Listar Produtos" component={ListarProdutos} options={{headerShown:false}}/>
            <Stack.Screen name="Detalhes Produto" component={DetalhesProduto} options={{headerShown:false}}/>

        </Stack.Navigator>
    );

}

//====================== Tela de Lista de Produtos ============================


function ListarProdutos({navigation}){

    const [carregando,setCarregando] = React.useState(true);
    const [dados, setDados] = React.useState([]);

    React.useEffect(()=>{
        fetch(`${host}/loja/service/produto/listartelainicial.php`)
        .then((response)=>response.json())
        .then((produto)=>setDados(produto.saida))
        .catch((error)=>console.error(`Error ao carregar a api ${error}`))
        .finally(()=>setCarregando(false))
    },[]);

     return(

        <ScrollView style={styles.scrollview} horizontal={true}>

            { carregando ? (
                <ActivityIndicator/>
            ):(
                <FlatList
                data={dados}
                renderItem={({item})=>(
                    <View style={styles.caixa}>
                        <Text style={styles.descricao}>Nome Produto: {item.nomeproduto}</Text>
                        <Text style={styles.descricao1}>Preço: R$ {item.preco}</Text>

                        <TouchableOpacity onPress={()=>{
                            navigation.navigate("Detalhes Produto",{
                                idproduto: `${item.idproduto}`
                            })
                        }} style={styles.btnProduto}>

                            <Text style={styles.txtBtnDetalhes}> Saiba mais</Text>

                        </TouchableOpacity>


                    </View>
                )}
                keyExtractor={({idproduto, index})=>idproduto}
                />
            )
            
            }



        </ScrollView>


    );
}


//====================== Tela de Detalhes de Produtos ============================


function DetalhesProduto({route}){

    const {idproduto} = route.params;

    const [carregando,setCarregando] = React.useState(true);
    const [dados, setDados] = React.useState([]);

    React.useEffect(()=>{
        fetch(`${host}/loja/service/produto/detalheproduto.php?idproduto=${idproduto}`)
        .then((response)=>response.json())
        .then((produto)=>setDados(produto.saida))
        .catch((error)=>console.error(`Error ao carregar a api ${error}`))
        .finally(()=>setCarregando(false))
    },[]);

     return(

        <ScrollView style={styles.scrollview} horizontal={false}>

            { carregando ? (
                <ActivityIndicator/>
            ):(
                <FlatList
                data={dados}
                renderItem={({item})=>(
                    <View >
                        <Image source={{uri:`${host}/loja/img/${item.foto1}`}} style={styles.foto} />
                   
                        
                        <Text style={styles.descricaoProduto}>Nome Produto: {item.nomeproduto}</Text>
                        <Text style={styles.descricaoProduto1}>Descrição: {item.descricao}</Text>
                        <Text style={styles.descricaoProduto2}>Preço: R$ {item.preco}</Text>
                       
                        <TouchableOpacity onPress={()=>{

                            db.transaction((tx)=>{
                                tx.executeSql("create table if not exists carrinho(id integer primary key, idproduto int, nomeproduto text, preco text, foto text);");
                            })

                            db.transaction((ts)=>{
                                ts.executeSql("insert into carrinho(idproduto, nomeproduto, preco,foto)values(?,?,?,?)",[item.idproduto,item.nomeproduto,item.preco,item.foto1]);
                            })

                            db.transaction((sl)=>{
                                sl.executeSql("select * from carrinho",[],(_,{rows})=>{
                                    console.log(JSON.stringify(rows));
                                });
                            });

                        }} style={styles.btnDetalhes}>

                            <Text style={styles.detalhes}>Adicionar ao Carrinho</Text>

                        </TouchableOpacity>


                    </View>
                )}
                keyExtractor={({idproduto, index})=>idproduto}
                />
            )
            
            }



        </ScrollView>


    );
}


//---------------------CSS da Tela

const styles = StyleSheet.create({
    scrollview:{
        flex:1,
        backgroundColor:"#7B808A"
        
    },

    btnDetalhes:{
        backgroundColor:'black',
        padding:10,
        margin:10,
        borderRadius:10,
        marginTop:20
        
    },

    btnProduto:{
        backgroundColor:'black',
        padding:10,
        margin:5,
        borderRadius:10
        
    },

    descricaoProduto:{
        marginRight:30,
        marginLeft:30,
        color:"white"
    },

    descricaoProduto1:{
        marginRight:30,
        marginLeft:30,
        color:"white"
    },

    descricaoProduto2:{
        marginRight:30,
        marginLeft:30,
        color:"white"
    },

    txtBtnDetalhes:{
        fontSize:12,
        color:"white",
        textAlign:"center"
    },

    detalhes:{
        color:"white",
        textAlign:"center"

    },  

    foto:{
        flex:1,
        resizeMode:'contain',
        width:300,
        height:250,
        marginLeft:50,
        marginBottom:5,
        marginTop:10,
        borderRadius:40
        
    },

    caixa:{
        margin:10,
        backgroundColor:'white',
        shadowColor:'black',
        shadowOpacity:10,
        padding:10,
        paddingBottom:30,
        paddingTop:30,
        borderColor:'silver',
        borderWidth:1,
        width:300,
        marginLeft:55,
        marginRight:50,
        marginBottom:20,
        borderRadius:10
    },

    descricao:{
        textAlign:"center",
        color:"black"
    },

    descricao1:{
        textAlign:"center",
        color:"black"
    },

})