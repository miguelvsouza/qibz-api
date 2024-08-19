import bcrypt from "bcrypt"

// This function hashes a password using bcrypt.
export async function hash(password: string) {
  return bcrypt.hash(password, 10)
}

// This function compares a password with a hash using bcrypt.
export async function compare(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}
