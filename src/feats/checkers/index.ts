import { loadEmailBlackList } from "../../helpers/validations/black_lists";

function passwordComplexity(password: string): {
  strength: "weak" | "medium" | "strong";
  message: string;
} {
  const length = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  if (length < 8 && (!hasUppercase || !hasLowercase || !hasNumber) && !hasSpecialChar) {
    return {
      strength: "weak",
      message:
        "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    };
  }

  if (length >= 8 && length < 12 && hasUppercase && hasLowercase && (hasNumber || hasSpecialChar)) {
    return {
      strength: "medium",
      message:
        "Password should be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.",
    };
  }

  if (length >= 12 && hasUppercase && hasLowercase && hasNumber && hasSpecialChar) {
    return {
      strength: "strong",
      message: "Password is strong",
    };
  }

  return {
    strength: "weak",
    message: "password is weak",
  };
}

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

export { passwordComplexity, emailIsValid };
