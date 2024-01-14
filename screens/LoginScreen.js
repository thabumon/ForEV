import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon } from 'react-native-heroicons/solid'
import { themeColors } from '../theme'
import { useNavigation } from '@react-navigation/native'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../config/firebase'

export default function LoginScreen() {
  const navigation = useNavigation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (email && password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        console.log('got error:', err.message);
      }
    }
  }
  return (
    <View className="flex-1 bg-white" style={{ backgroundColor: themeColors.bg }}>
      <SafeAreaView className="flex ">
        <View className="flex-row justify-start">
          <TouchableOpacity onPress={() => navigation.goBack()}
            className=" p-2 rounded-tr-2xl rounded-bl-2xl ml-4"
            >
            <ArrowLeftIcon size="20" color="#2c8de8" />
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-center">
          <Image source={require('../assets/icon.png')}
            style={{ width: 200, height: 200 }} />
        </View>


      </SafeAreaView>
      <View
        style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50,backgroundColor: '#2c8de8',marginTop:30}}
        className="flex-1  px-8 pt-8">
        <View className="form space-y-2">
          <Text className="text-white ml-4">Email Address</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
            placeholder="Email"
            value={email}
            onChangeText={value => setEmail(value)}
          />
          <Text className="text-white ml-4">Password</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl"
            secureTextEntry
            placeholder="Password"
            value={password}
            onChangeText={value => setPassword(value)}
          />
          <TouchableOpacity className="flex items-end" onPress={()=> navigation.navigate('ForgotPassword')}>
         
            <Text className="text-white mb-5">Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit}
            className="py-3 rounded-xl" style={{ backgroundColor: 'white',color:'#2c8de8'}}>

            <Text
             className="text-xl font-bold text-center" style={{ color:'#2c8de8'}}>
              Login
            </Text>
          </TouchableOpacity>

        </View>
        <Text className="text-xl text-white font-bold text-center py-7">Or</Text>
        {/* <View className="flex-row justify-center space-x-12"> */}
          {/* <TouchableOpacity className="p-2 bg-gray-100 rounded-2xl">
            <Image source={require('../assets/icons/google.png')} className="w-10 h-10" />
          </TouchableOpacity> */}
          {/* <TouchableOpacity className="p-2 bg-gray-100 rounded-2xl">
            <Image source={require('../assets/icons/apple.png')} className="w-10 h-10" />
          </TouchableOpacity> */}
          {/* <TouchableOpacity className="p-2 bg-gray-100 rounded-2xl">
            <Image source={require('../assets/icons/facebook.png')} className="w-10 h-10" />
          </TouchableOpacity> */}
        {/* </View> */}
        <View className="flex-row justify-center mt-7">
          <Text className="text-white font-semibold">
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="font-semibold text-white"> Sign Up</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>

  )
}