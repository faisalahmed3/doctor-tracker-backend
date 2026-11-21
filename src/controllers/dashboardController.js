
import { getDashboardSummary as getDashboardSummaryService } from "../services/dashboardService.js";

export const getDashboardSummary = async (req, res) => {
  const dashboard = await getDashboardSummaryService();

  res.status(200).json({
    success: true,
    message: "Dashboard statistics retrieved successfully.",
    data: dashboard,
  });
};
