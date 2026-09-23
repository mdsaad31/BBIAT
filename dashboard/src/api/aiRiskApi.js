import axios from "axios";
import { AI_SERVICE_URL } from "../contractConfig";

export async function fetchRiskScores() {
  const response = await axios.get(`${AI_SERVICE_URL}/risk-scores`);
  return response.data;
}
