import { useContext } from "react";
import styles from "./App.module.scss";
import { LoginBox } from "./components/LoginBox";
import { MessageList } from "./components/MessageList";
import { SendMessageForm } from "./components/SendMessageForm";
import { AuthContext } from "./contexts/auth";

export function App() {
	const { user } = useContext(AuthContext);

	return (
		<main
			className={`${styles.contentWrapper} ${
				!!user ? styles.contextSigned : ""
			} `}
		>
			<MessageList />
			{
				// Não for nulo
				!!user ? <SendMessageForm /> : <LoginBox />
			}
			<h1>Hello World</h1>
		</main>
	);
}
