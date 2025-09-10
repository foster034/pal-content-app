"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartDataPoint {
  month: string;
  value: number;
}

const data: ChartDataPoint[] = [
  { month: "Jan", value: 65 },
  { month: "Feb", value: 59 },
  { month: "Mar", value: 80 },
  { month: "Apr", value: 81 },
  { month: "May", value: 56 },
  { month: "Jun", value: 89 },
  { month: "Jul", value: 95 },
  { month: "Aug", value: 78 },
  { month: "Sep", value: 85 },
  { month: "Oct", value: 92 },
  { month: "Nov", value: 88 },
  { month: "Dec", value: 98 },
];

export function AnimatedChart() {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Content Submissions</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm text-muted-foreground">Monthly</span>
          </div>
        </CardTitle>
        <CardDescription>
          Marketing content submissions from technicians across all franchises
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-2 p-4">
          {data.map((item, index) => (
            <div
              key={item.month}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <motion.div
                className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-md relative overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: `${(item.value / maxValue) * 240}px`,
                  opacity: 1 
                }}
                transition={{
                  duration: 1.5,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                />
                <motion.div
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground bg-background/90 px-2 py-1 rounded border shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 1 }}
                >
                  {item.value}
                </motion.div>
              </motion.div>
              <motion.span
                className="text-xs text-muted-foreground font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {item.month}
              </motion.span>
            </div>
          ))}
        </div>
        <motion.div 
          className="mt-4 p-4 bg-muted/30 rounded-lg border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Average monthly growth:</span>
            <span className="font-semibold text-primary">+12.5%</span>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}