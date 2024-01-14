import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native'
import React, {createContext, useState } from 'react'
import { themeColors } from '../theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';


export const SignUpNameContext = createContext();


// subscribe for more videos like this :)
export default function SignUpScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');



    const handleSubmit = async () => {
        if (email && password) {
            try {
                await createUserWithEmailAndPassword(auth, email, password);

                console.log('User signed up with name:', name);
            } catch (err) {
                console.log('got error:', err.message);
            }
        }
    }
    

    return (
        <View className="flex-1" style={{ backgroundColor: themeColors.bg }}>
            <SafeAreaView className="flex">
                <View className="flex-row justify-start">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className=" p-2 rounded-tr-2xl rounded-bl-2xl ml-4"
                    >
                        <ArrowLeftIcon size="20" color="#2c8de8" />
                    </TouchableOpacity>
                </View>
                <View className="flex-row justify-center">
                    <Image source={require('../assets/icon.png')}
                        style={{ width: 200, height: 200  }} />
                </View>
            </SafeAreaView>
            <View className="flex-1 px-8 pt-8"
                style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50,backgroundColor: '#2c8de8', marginTop:20 }}
            >
                <View className="form space-y-2">
                    <Text className="text-white ml-4">Full Name</Text>
                    <TextInput
                        className="p-4 bg-gray-100 text-white rounded-2xl mb-3"
                        value={name}
                        onChangeText={value => setName(value)}
                        placeholder='Enter Name'
                    />
                    <Text className="text-white ml-4">Email Address</Text>
                    <TextInput
                        className="p-4 bg-gray-100 text-white rounded-2xl mb-3"
                        value={email}
                        onChangeText={value => setEmail(value)}
                        placeholder='Enter Email'
                    />
                    <Text className="text-white ml-4">Password</Text>
                    <TextInput
                        className="p-4 bg-gray-100 text-white rounded-2xl mb-7"
                        secureTextEntry
                        value={password}
                        onChangeText={value => setPassword(value)}
                        placeholder='Enter Password'
                    />
                    <TouchableOpacity
                        className="py-3 rounded-xl" style={{ backgroundColor: 'white'}}
                        onPress={handleSubmit}
                    >
                        <Text className="text-xl font-bold text-center " style={{color:'#2c8de8'}}>
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text className="text-xl text-white font-bold text-center py-5">
                    Or
                </Text>
                <View className="flex-row justify-center space-x-12">
                    {/* <TouchableOpacity className="p-2 bg-gray-100 rounded-2xl">
                        <Image source={require('../assets/icons/google.png')}
                            className="w-10 h-10" />
                    </TouchableOpacity> */}


                </View>
                <View className="flex-row justify-center mt-7" style={{ paddingHorizontal: 20, marginTop: 7 }} >
                    <Text className="text-white font-semibold" >Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text className="font-semibold text-white"> Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}
