
import Doctor from "../models/Doctor.js";

const getMonthKeys = (months = 6) => {
  const now = new Date();

  return Array.from({ length: months }, (_, index) => {
    const date = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() - months + 1 + index,
        1
      )
    );

    return date.toISOString().slice(0, 7);
  });
};

export const getDashboardSummary = async () => {
  const monthKeys = getMonthKeys();
  const startDate = new Date(`${monthKeys[0]}-01T00:00:00.000Z`);

  const [result] = await Doctor.aggregate([
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalDoctors: { $sum: 1 },
              activeDoctors: {
                $sum: {
                  $cond: [{ $eq: ["$status", "Active"] }, 1, 0],
                },
              },
              totalPatients: {
                $sum: {
                  $size: { $ifNull: ["$patients", []] },
                },
              },
              doctorsWithPatients: {
                $sum: {
                  $cond: [
                    {
                      $gt: [
                        { $size: { $ifNull: ["$patients", []] } },
                        0,
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              specializations: { $addToSet: "$specialization" },
            },
          },
          {
            $project: {
              _id: 0,
              totalDoctors: 1,
              activeDoctors: 1,
              totalPatients: 1,
              doctorsWithPatients: 1,
              totalSpecializations: {
                $size: {
                  $filter: {
                    input: "$specializations",
                    as: "item",
                    cond: {
                      $and: [
                        { $ne: ["$$item", null] },
                        { $ne: ["$$item", ""] },
                      ],
                    },
                  },
                },
              },
            },
          },
        ],

        patientsPerDoctor: [
          {
            $project: {
              _id: 0,
              doctorId: { $toString: "$_id" },
              name: 1,
              specialization: 1,
              status: 1,
              patientCount: {
                $size: { $ifNull: ["$patients", []] },
              },
            },
          },
          { $sort: { patientCount: -1, name: 1 } },
          { $limit: 8 },
        ],

        patientRegistrations: [
          { $unwind: "$patients" },
          {
            $match: {
              "patients.registeredAt": { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$patients.registeredAt",
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],

        doctorRegistrations: [
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$createdAt",
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],

        recentPatients: [
          { $unwind: "$patients" },
          { $sort: { "patients.registeredAt": -1 } },
          { $limit: 6 },
          {
            $project: {
              _id: 0,
              id: "$patients.id",
              name: "$patients.name",
              condition: "$patients.condition",
              registeredAt: "$patients.registeredAt",
              doctorId: { $toString: "$_id" },
              doctorName: "$name",
            },
          },
        ],

        recentDoctors: [
          { $sort: { createdAt: -1 } },
          { $limit: 6 },
          {
            $project: {
              _id: 0,
              id: { $toString: "$_id" },
              name: 1,
              specialization: 1,
              status: 1,
              createdAt: 1,
              patientCount: {
                $size: { $ifNull: ["$patients", []] },
              },
            },
          },
        ],
      },
    },
  ]);

  const summary = result?.summary?.[0] || {
    totalDoctors: 0,
    activeDoctors: 0,
    totalPatients: 0,
    doctorsWithPatients: 0,
    totalSpecializations: 0,
  };

  const patientCounts = new Map(
    (result?.patientRegistrations || []).map(
      ({ _id, count }) => [_id, count]
    )
  );

  const doctorCounts = new Map(
    (result?.doctorRegistrations || []).map(
      ({ _id, count }) => [_id, count]
    )
  );

  return {
    ...summary,
    inactiveDoctors: summary.totalDoctors - summary.activeDoctors,
    patientsPerDoctor: result?.patientsPerDoctor || [],
    monthlyRegistrations: monthKeys.map((month) => ({
      month,
      patients: patientCounts.get(month) || 0,
      doctors: doctorCounts.get(month) || 0,
    })),
    recentPatients: result?.recentPatients || [],
    recentDoctors: result?.recentDoctors || [],
  };
};
