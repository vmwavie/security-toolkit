import { loadEmailBlackList } from "../../helpers/validations/black_lists";
import { validatePassword } from "./passwordValidator";
async function emailIsValid(email: string): Promise<{
  isValid: boolean;
  trust: number;
}> {
  if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return {
      isValid: false,
      trust: 0,
    };
  }

  const cachedEmailBlackList = await loadEmailBlackList();

  if (cachedEmailBlackList.has(email.split("@")[1])) {
    return {
      isValid: false,
      trust: 0.5,
    };
  }

  return {
    isValid: true,
    trust: 1,
  };
}

export { emailIsValid, validatePassword };
