import { View, Text, Button, StyleSheet } from "react-native";
import { Profissional } from "../../services/auth_service";

// Recebe o usuário logado e uma função para sair
type Props = {
    profissional: Profissional;
    aoSair: () => void;
};

export default function HomeScreen({ profissional, aoSair }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Home</Text>
            <Text>Nome: {profissional.nome}</Text>
            <Text>Perfil: {profissional.perfil}</Text>
            <Text>Registro: {profissional.registro}</Text>
            <Button title="Sair" onPress={aoSair} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
    titulo: { fontSize: 28, fontWeight: "bold", textAlign: "center" },
});