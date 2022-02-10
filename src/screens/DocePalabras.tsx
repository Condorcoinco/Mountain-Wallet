import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Platform,
  Modal,
  RefreshControl
} from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import * as Animatable from "react-native-animatable";
import { readMnemonic } from "../../api";
import { Lotierror, Lotiexito } from "./component/lottie";
import { styles } from "../theme/appTheme";
import Icon from "react-native-vector-icons/Feather";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const elements: string[] = [];
const doceIncompleta: string[] = [];
const arr: number[] = [];

const altura = Platform.OS === "ios" ? 22 : 25;

function leerMnemonic() {
  const mnemonic = readMnemonic();

  mnemonic.then((value) => {
    const docePalabras = value;
    const words = docePalabras.split(" ");
    for (let index = 0; index < 12; index++) {
      elements.push(words[index]);
      doceIncompleta.push(words[index]);
    }
  });
  //recorre las tres palabras restantes
  setTimeout(() => {
    while (arr.length < 3) {
      var r = Math.floor(Math.random() * 11) + 1;
      if (arr.indexOf(r) === -1) {
        arr.push(r);
        doceIncompleta[r] = "";
      }
    }
  }, 1);
}

const DocePalabras = ({ navigation }: { navigation: any }) => {
  
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    setRefreshing(true);
    
    if (elements.length === 0){
      leerMnemonic();
      
    }else{
      console.log('lleno');
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 5);
  }, []);

  console.log(elements);

  //Modal
  const [anmt, setanmt] = useState("");
  const [MostrarModal, setModal] = useState(false);
  const [MostrarError, setError] = useState("");
  const [lottie, setLottie] = useState(<Lotierror />);
  const [mostrartitulo, setmostrartitulo] = useState("");

  //casillas faltantes
  const [values, setValues] = useState({
    "vacio[1]": "",
  });
  //Esta funcion actualiza y toma lo que esta en la caja de texto
  function handleChange(text: string, eventName: string) {
    setValues((prev) => {
      return {
        ...prev,
        [eventName]: text,
      };
    });
  }
  // funcion para añadir las tres palabras restantes al arreglo y comparar que las 3 palabras faltantes sean las correctas
  //con respecto al arreglo original
  function addTresFaltantes() {
    for (let index = 0; index < doceIncompleta.length; index++) {
      if (doceIncompleta[index] === "") {
        doceIncompleta[index] = values["vacio[" + index + "]"];
      }
    }
    let arreglo1 = elements.toString();
    let arreglo2 = doceIncompleta.toString();

    if (arreglo1 === arreglo2) {
      setanmt("fadeInDownBig");
      setmostrartitulo("Correcto");
      setError("Palabras correctas");
      setModal(true);
      setLottie(<Lotiexito />);
      setTimeout(() => {
        setanmt("fadeOutUp");
        setTimeout(() => {
          setModal(false);
        }, 100);
        navigation.navigate("Contraseña");
      }, 1000);
    } else {
      //alert("Frases incorrectas");
      setanmt("fadeInDownBig");
      setmostrartitulo("Incorrecto");
      setError("Palabras incorrectas");
      setModal(true);
      setLottie(<Lotierror />);
      setTimeout(() => {
        setanmt("fadeOutUp");
        setTimeout(() => {
          setModal(false);
        }, 100);
      }, 1000);
      for (let i = 0; i < doceIncompleta.length; i++) {
        for (let j = 0; j < arr.length; j++) {
          if (i == arr[j]) {
            doceIncompleta[i] = "";
          }
        }
      }
    }
  }

  return (
    <KeyboardAwareScrollView style={styles.body}>
      <ScrollView
        style={{ backgroundColor: "red" }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor="#5b298a"
            colors={["#5b298a", "#7e54a7"]}
          />
        }
      ></ScrollView>
      <Modal
        visible={MostrarModal}
        transparent
        onRequestClose={() => setModal(false)}
        hardwareAccelerated
      >
        <Animatable.View animation={anmt} duration={600}>
          <View style={styles.bodymodal}>
            <View style={styles.ventanamodal}>
              <View style={styles.icontext}>
                <View style={styles.contenedorlottie}>{lottie}</View>
              </View>
              <View style={styles.textnoti}>
                <View style={styles.contenedortext}>
                  <Text style={styles.texticon}>{mostrartitulo}</Text>
                </View>
                <View>
                  <Text style={styles.notificacion}>{MostrarError}</Text>
                </View>
              </View>
            </View>
          </View>
        </Animatable.View>
      </Modal>
      <View style={styles.completo}>
        <View style={styles.cajaatras}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.btndo}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={altura} color="#440577" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerDos}>
          <Text style={styles.headerTitle}>
            Escribe las tres palabras {"\n"}faltantes en tu frase de {"\n"}
            respaldo.
          </Text>
        </View>
        <View style={styles.headerPrimario}>
          {doceIncompleta.map((j, index) => {
            if (doceIncompleta[index] === "") {
              return (
                <TextInput
                  key={index}
                  autoCapitalize="none"
                  style={styles.fondoFrases}
                  onChangeText={(text) =>
                    handleChange(text, "vacio[" + index + "]")
                  }
                >
                  <Text style={styles.txtDoceIncompleta}>
                    {doceIncompleta[index]}
                  </Text>
                </TextInput>
              );
            } else {
              return (
                <TextInput key={index} style={styles.fondoFrases} editable={false}>
                  <Text style={styles.txtDoceIncompleta}>
                    {doceIncompleta[index]}
                  </Text>
                </TextInput>
              );
            }
          })}
        </View>
        <View>
          <TouchableOpacity
            style={styles.btnContinuar}
            onPress={() => addTresFaltantes()}
          >
            <Text style={styles.txtContinuar}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const cuadroios = Platform.OS === "ios" ? 55 : 45;
const alturaios = Platform.OS === "ios" ? "11%" : "2%";

export default DocePalabras;
