import { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  LabelList,
  ReferenceLine,
} from "recharts";
import { API_BASE } from "../config";

export default function ActorPowerInterestChart({ slug, tipe }) {
  const [actors, setActors] = useState([]);

  useEffect(() => {
    async function fetchActors() {
      try {
        const resp = await fetch(
          `${API_BASE}/api/articles/${tipe}/${slug}/actors/`,
        );
        const data = await resp.json();

        const actorList = data.actors || [];
        const interestList = data.actor_interests || [];

        const merged = actorList.map((actor) => {
          const interestData = interestList.find(
            (ai) => ai.actor_id === actor.id,
          );
          const score =
            ((interestData?.interest || 0) + (interestData?.power || 0)) / 2;
          const color =
            score > 0.75
              ? "#e63946"
              : score > 0.5
                ? "#f4a261"
                : score > 0.25
                  ? "#e9c46a"
                  : "#2a9d8f";

          return {
            id: actor.id,
            name: actor.name,
            interest: Math.round((interestData?.interest || 0) * 100),
            power: Math.round((interestData?.power || 0) * 100),
            color,
            note: interestData?.note,
          };
        });

        setActors(merged);
      } catch (err) {
        console.error("Failed to load actors", err);
        setActors([]);
      }
    }

    fetchActors();
  }, [slug]);

  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <div className="bg-transparent border-0">
      <h5
        className="font-semibold uppercase text-gray-500 mb-2"
        style={{ color: "#555333" }}
      >
        PIHAK TERLIBAT
      </h5>
      <div className="bg-white p-3 rounded shadow-sm">
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#d9d3bb" strokeDasharray="0" />

            <ReferenceLine x={50} stroke="#a89b74" strokeWidth={1.6} />
            <ReferenceLine y={50} stroke="#a89b74" strokeWidth={1.6} />

            <XAxis
              type="number"
              dataKey="interest"
              domain={[0, 100]}
              ticks={ticks}
              tick={() => null}
              tickLine={false}
              interval={0}
              allowDataOverflow
            >
              <Label
                value="INTEREST"
                position="bottom"
                offset={-20}
                style={{ fill: "#c46b00", fontWeight: 600 }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="power"
              domain={[0, 100]}
              ticks={ticks}
              tick={() => null}
              tickLine={false}
              interval={0}
              allowDataOverflow
            >
              <Label
                value="POWER"
                angle={-90}
                position="insideLelft"
                style={{ fill: "#c46b00", fontWeight: 600 }}
              />
            </YAxis>

            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const actor = payload[0].payload;
                  return (
                    <div className="p-2 rounded bg-white border text-sm">
                      <strong>{actor.name}</strong>
                      <div>Power: {actor.power}%</div>
                      <div>Interest: {actor.interest}%</div>
                      {actor.note && (
                        <div className="text-muted">{actor.note}</div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Scatter
              name="Actors"
              data={actors}
              shape={(props) => {
                const { cx, cy, payload } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={9}
                    fill={payload.color}
                    opacity={0.95}
                  />
                );
              }}
            >
              <LabelList
                dataKey="name"
                position="right"
                style={{
                  fontSize: 11,
                  fill: "#444",
                  fontWeight: 500,
                }}
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {actors.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-2">
            No actor data
          </div>
        )}
      </div>
    </div>
  );
}
