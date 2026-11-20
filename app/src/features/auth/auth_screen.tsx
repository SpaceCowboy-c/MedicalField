import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { login, AuthError, Profissional } from "../../services/auth_service";

// A tela recebe uma função "aoLogar" do App.tsx.
// Quando o login der certo, ela é chamada com o usuário, e o App troca de tela.
type Props = {
    aoLogar: (profissional: Profissional, token: string) => void;
};

export default function AuthScreen({ aoLogar }: Props) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    // Chamada quando o botão "Entrar" é tocado
    async function entrar() {
        setErro("");
        setCarregando(true);
        try {
           
            const resposta = await login(email, senha);  // Chama POST /auth/login (auth_service.ts)
            aoLogar(resposta.profissional, resposta.token); //deu certo troca de tela
        } catch (e) {
            setErro(e instanceof AuthError ? e.message : "Erro inesperado");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>MedicalField</Text>

            <TextInput
                style={styles.campo}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.campo}
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />

            {erro !== "" && <Text style={styles.erro}>{erro}</Text>}

            {carregando ? (
                <ActivityIndicator />
            ) : (
                <Button title="Entrar" onPress={entrar} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
    titulo: { fontSize: 28, fontWeight: "bold", textAlign: "center" },
    campo: { borderWidth: 1, borderColor: "#999", borderRadius: 6, padding: 10 },
    erro: { color: "red", textAlign: "center" },
});