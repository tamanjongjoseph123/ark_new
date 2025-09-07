import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

export default function PaymentScreen() {
  const navigation = useNavigation()
  const [selectedMethod, setSelectedMethod] = useState("")
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const paymentMethods = [
    {
      id: "momo",
      name: "Mobile Money",
      icon: "phone-portrait-outline",
      description: "Pay with MTN, Airtel, or Vodafone",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: "card-outline",
      description: "Direct bank transfer or card payment",
    },
  ]

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedMethod(methodId)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={["#1e67cd", "#4f83e0"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Secure Your Donation</Text>
        <Text style={styles.headerSubtitle}>
          Payment to become a son of john chi
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                selectedMethod === method.id && styles.selectedPaymentMethod,
              ]}
              onPress={() => handlePaymentMethodSelect(method.id)}
            >
              <View style={styles.paymentMethodContent}>
                <View style={styles.paymentMethodLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      selectedMethod === method.id &&
                        styles.selectedIconContainer,
                    ]}
                  >
                    <Ionicons
                      name={method.icon}
                      size={24}
                      color={selectedMethod === method.id ? "#ffffff" : "#1e67cd"}
                    />
                  </View>
                  <View style={styles.paymentMethodText}>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                    <Text style={styles.paymentMethodDescription}>
                      {method.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.radioButton}>
                  {selectedMethod === method.id && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>XAF</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              editable={!isProcessing}
            />
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={20} color="#10b981" />
          <Text style={styles.securityText}>
            Your payment is secured with 256-bit SSL encryption
          </Text>
        </View>

        {/* Proceed Button (does nothing now) */}
        <TouchableOpacity
          style={[styles.proceedButton, isProcessing && styles.disabledButton]}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={
              isProcessing ? ["#9ca3af", "#6b7280"] : ["#1e67cd", "#4f83e0"]
            }
            style={styles.proceedButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.proceedButtonText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* ✅ Next Button (scrollable with content) */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate("courses")}
        >
          <LinearGradient
            colors={["#1e67cd", "#4f83e0"]}
            style={styles.nextGradient}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="white"
              style={{ marginLeft: 8 }}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#e0f7fa",
    textAlign: "center",
  },
  content: { padding: 20 },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 15,
  },
  paymentMethodCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    elevation: 5,
  },
  selectedPaymentMethod: {
    borderColor: "#1e67cd",
    backgroundColor: "#f0f4ff",
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentMethodLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0f7fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedIconContainer: { backgroundColor: "#1e67cd" },
  paymentMethodText: { flex: 1 },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  paymentMethodDescription: { fontSize: 14, color: "#6b7280" },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1e67cd",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: "#374151",
    paddingVertical: 16,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  securityText: { fontSize: 14, color: "#059669", marginLeft: 8, flex: 1 },
  proceedButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 8,
  },
  disabledButton: { opacity: 0.6 },
  proceedButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  proceedButtonText: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
  processingContainer: { flexDirection: "row", alignItems: "center" },
  nextButton: {
    marginTop: 10,
    marginBottom: 40, // ✅ gives breathing space from the bottom
    borderRadius: 25,
    overflow: "hidden",
    alignSelf: "center",
    width: "70%",
    elevation: 4,
  },
  nextGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  nextButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
})
